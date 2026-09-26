import { Router, Request, Response } from 'express';
import { db } from '../data/store';
import { Product, StockMovement, InventoryRecord } from '../../src/types/index';
import { pgService } from '../services/pgService.js';

const router = Router();

// GET /api/stocks/products
router.get('/products', async (req: Request, res: Response) => {
  const { category, search, lowStockOnly } = req.query;
  const pgProds = await pgService.getProducts();
  let list = (pgProds && pgProds.length > 0) ? [...pgProds] : [...db.products];

  if (category && category !== 'TOUTES') {
    list = list.filter(p => p.category === category);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.reference.toLowerCase().includes(q)
    );
  }

  if (lowStockOnly === 'true') {
    list = list.filter(p => p.stockCurrent <= p.stockMin);
  }

  const totalStockValue = list.reduce((sum, p) => sum + (p.stockCurrent * p.cmup), 0);
  const lowStockCount = list.filter(p => p.stockCurrent <= p.stockMin).length;

  res.json({
    products: list,
    totalCount: list.length,
    lowStockCount,
    totalStockValue,
    categories: Array.from(new Set(list.map(p => p.category)))
  });
});

// POST /api/stocks/products
router.post('/products', (req: Request, res: Response) => {
  const {
    name,
    category = 'Divers',
    unit = 'Pièce',
    purchasePrice = 0,
    sellingPrice = 0,
    stockCurrent = 0,
    stockMin = 10,
    supplierId
  } = req.body;

  if (!name || Number(sellingPrice) <= 0) {
    return res.status(400).json({ error: 'Le nom du produit et le prix de vente sont requis.' });
  }

  const cmup = Number(purchasePrice) || Number(sellingPrice) * 0.7;
  const marginPercent = Number(sellingPrice) > 0 
    ? Number((((Number(sellingPrice) - cmup) / Number(sellingPrice)) * 100).toFixed(2))
    : 0;

  const count = db.products.length + 1;
  const refPrefix = category.slice(0, 3).toUpperCase();
  const reference = `${refPrefix}-${count.toString().padStart(4, '0')}`;

  const newProduct: Product = {
    id: `prod_${Date.now()}`,
    reference,
    name,
    category,
    unit,
    purchasePrice: Number(purchasePrice),
    sellingPrice: Number(sellingPrice),
    cmup: Math.round(cmup),
    stockCurrent: Number(stockCurrent),
    stockMin: Number(stockMin),
    marginPercent,
    supplierId
  };

  db.products.unshift(newProduct);
  pgService.addProduct(newProduct).catch(() => {});

  if (Number(stockCurrent) > 0) {
    db.stockMovements.unshift({
      id: `mvt_${Date.now()}`,
      referenceDoc: 'INITIAL-STOCK',
      date: new Date().toISOString().split('T')[0],
      type: 'ENTREE',
      productId: newProduct.id,
      productName: newProduct.name,
      quantity: Number(stockCurrent),
      unitCost: cmup,
      totalCost: Number(stockCurrent) * cmup,
      newCmup: cmup,
      reason: 'Stock d\'ouverture initial',
      performedBy: db.user.name
    });
  }

  res.status(201).json({
    product: newProduct,
    message: `Produit "${newProduct.name}" créé avec succès (Réf: ${reference})`
  });
});

// POST /api/stocks/movements (Entrée fournisseur, Sortie, Ajustement)
router.post('/movements', (req: Request, res: Response) => {
  const {
    type,
    productId,
    quantity,
    unitCost,
    reason,
    referenceDoc
  } = req.body;

  const product = db.products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Produit introuvable.' });
  }

  const qty = Number(quantity);
  const cost = Number(unitCost) || product.purchasePrice;

  if (qty <= 0) {
    return res.status(400).json({ error: 'La quantité doit être supérieure à zéro.' });
  }

  let newCmup = product.cmup;
  let newStock = product.stockCurrent;

  if (type === 'ENTREE') {
    // OHADA CMUP Formula
    newCmup = db.calculateCMUP(product.stockCurrent, product.cmup, qty, cost);
    newStock = product.stockCurrent + qty;
    product.purchasePrice = cost;
  } else if (type === 'SORTIE') {
    if (qty > product.stockCurrent) {
      return res.status(400).json({ 
        error: `Stock insuffisant pour cette sortie (${product.stockCurrent} disponible, ${qty} demandé)` 
      });
    }
    newStock = product.stockCurrent - qty;
  } else if (type === 'AJUSTEMENT') {
    newStock = qty; // For adjustments, quantity is the new physical target
  }

  product.stockCurrent = newStock;
  product.cmup = newCmup;
  product.marginPercent = Number((((product.sellingPrice - newCmup) / product.sellingPrice) * 100).toFixed(2));

  const doc = referenceDoc || `BL-${Date.now().toString().slice(-5)}`;
  const newMovement: StockMovement = {
    id: `mvt_${Date.now()}`,
    referenceDoc: doc,
    date: new Date().toISOString().split('T')[0],
    type,
    productId: product.id,
    productName: product.name,
    quantity: qty,
    unitCost: cost,
    totalCost: qty * cost,
    newCmup,
    reason: reason || `Mouvement ${type} de stock`,
    performedBy: db.user.name
  };

  db.stockMovements.unshift(newMovement);

  res.status(201).json({
    movement: newMovement,
    updatedProduct: product,
    message: `Mouvement de stock (${type}) enregistré avec mise à jour du CMUP (${newCmup} FCFA).`
  });
});

// GET /api/stocks/movements
router.get('/movements', (req: Request, res: Response) => {
  res.json({
    movements: db.stockMovements,
    total: db.stockMovements.length
  });
});

// POST /api/stocks/inventory-reconciliation (Inventaire physique contradictoire)
router.post('/inventory-reconciliation', (req: Request, res: Response) => {
  const { productId, physicalStock, notes } = req.body;
  const product = db.products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: 'Produit introuvable' });
  }

  const theoreticalStock = product.stockCurrent;
  const physical = Number(physicalStock);
  const variance = physical - theoreticalStock;
  const varianceValueFCFA = Math.round(variance * product.cmup);

  let status: 'CONFORME' | 'ECART_MINEUR' | 'ECART_CRITIQUE' = 'CONFORME';
  if (variance !== 0) {
    const absVarianceValue = Math.abs(varianceValueFCFA);
    status = absVarianceValue > 100000 ? 'ECART_CRITIQUE' : 'ECART_MINEUR';
  }

  const record: InventoryRecord = {
    id: `inv_rec_${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    productId: product.id,
    productName: product.name,
    theoreticalStock,
    physicalStock: physical,
    variance,
    varianceValueFCFA,
    status,
    notes: notes || (variance === 0 ? 'Conforme au stock théorique' : `Écart constaté de ${variance} unités`)
  };

  db.inventoryRecords.unshift(record);

  // If critical discrepancy, create a fraud / audit alert
  if (status === 'ECART_CRITIQUE') {
    db.fraudAlerts.unshift({
      id: `alert_${Date.now()}`,
      severity: 'HAUTE',
      title: `Écart de stock critique sur ${product.name}`,
      description: `Perte/Manquant physique de ${Math.abs(variance)} ${product.unit} valorisé à ${Math.abs(varianceValueFCFA)} FCFA.`,
      amountImpactFCFA: Math.abs(varianceValueFCFA),
      date: record.date,
      suggestedFix: 'Convoquer l\'équipe magasin, vérifier les bons de livraison récents et ajuster le stock.'
    });
  }

  // Adjust stock
  product.stockCurrent = physical;

  res.status(201).json({
    record,
    adjustedStock: product.stockCurrent,
    message: `Inventaire consigné. Écart de ${variance} ${product.unit} enregistré.`
  });
});

export default router;
