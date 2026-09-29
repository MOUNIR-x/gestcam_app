import { Router, Request, Response } from 'express';
import authMiddleware from '../middleware/auth.js';
import { Product, StockMovement } from '../../src/types/index';
import { pgService } from '../services/pgService.js';

const router = Router();

// Require authentication for stock operations
router.use(authMiddleware);

// Helper to recalculate inventory CMUP (Coût Moyen Unitaire Pondéré - Norme OHADA)
function calculateCMUP(currentStock: number, currentCmup: number, incomingQty: number, incomingCost: number): number {
  const totalQty = currentStock + incomingQty;
  if (totalQty <= 0) return incomingCost;
  const totalValuation = (currentStock * currentCmup) + (incomingQty * incomingCost);
  return Math.round(totalValuation / totalQty);
}

// GET /api/stocks/products
router.get('/products', async (req: Request, res: Response) => {
  const { category, search, lowStockOnly } = req.query;
  const companyId = Number((req as any).auth?.companyId);
  if (!companyId) return res.status(403).json({ error: 'Contexte entreprise manquant' });

  try {
    const pgProds = await pgService.getProducts(companyId);
    let list: any[] = [...pgProds];

    if (category && category !== 'TOUTES') {
      list = list.filter(p => p.category === category);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.reference && p.reference.toLowerCase().includes(q))
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
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erreur lors du chargement des produits' });
  }
});

// POST /api/stocks/products
router.post('/products', async (req: Request, res: Response) => {
  const companyId = Number((req as any).auth?.companyId);
  if (!companyId) return res.status(403).json({ error: 'Contexte entreprise manquant' });

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

  try {
    const existing = await pgService.getProducts(companyId);
    const count = existing.length + 1;
    const refPrefix = category.slice(0, 3).toUpperCase();
    const reference = `${refPrefix}-${count.toString().padStart(4, '0')}`;

    const cmup = Number(purchasePrice) || Number(sellingPrice) * 0.7;
    const marginPercent = Number(sellingPrice) > 0 
      ? Number((((Number(sellingPrice) - cmup) / Number(sellingPrice)) * 100).toFixed(2))
      : 0;

    const newProduct: Omit<Product, 'id'> = {
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
      supplierId: supplierId ? String(supplierId) : undefined
    };

    const inserted = await pgService.addProduct(newProduct, companyId);

    if (Number(stockCurrent) > 0 && inserted) {
      await pgService.addStockMovement({
        referenceDoc: 'INITIAL-STOCK',
        date: new Date().toISOString().split('T')[0],
        type: 'ENTREE',
        productId: inserted.id,
        productName: inserted.name,
        quantity: Number(stockCurrent),
        unitCost: cmup,
        totalCost: Number(stockCurrent) * cmup,
        newCmup: cmup,
        reason: 'Stock d\'ouverture initial',
        performedBy: (req as any).auth?.email || 'GestCam'
      }, companyId);
    }

    res.status(201).json({
      product: inserted,
      message: `Produit "${newProduct.name}" créé avec succès (Réf: ${reference})`
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erreur lors de la création du produit' });
  }
});

// POST /api/stocks/movements (Entrée fournisseur, Sortie, Ajustement)
router.post('/movements', async (req: Request, res: Response) => {
  const companyId = Number((req as any).auth?.companyId);
  if (!companyId) return res.status(403).json({ error: 'Contexte entreprise manquant' });

  const {
    type,
    productId,
    quantity,
    unitCost,
    reason,
    referenceDoc
  } = req.body;

  try {
    const products = await pgService.getProducts(companyId);
    const product = products.find(p => String(p.id) === String(productId) || p.reference === productId);

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
      newCmup = calculateCMUP(product.stockCurrent, product.cmup, qty, cost);
      newStock = product.stockCurrent + qty;
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

    const marginPercent = Number((((product.sellingPrice - newCmup) / product.sellingPrice) * 100).toFixed(2));

    await pgService.updateProductStock(product.id, newStock, newCmup, cost, marginPercent, companyId);

    const doc = referenceDoc || `BL-${Date.now().toString().slice(-5)}`;
    const movement = await pgService.addStockMovement({
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
      performedBy: (req as any).auth?.email || 'GestCam'
    }, companyId);

    res.status(201).json({
      movement,
      updatedProduct: {
        ...product,
        stockCurrent: newStock,
        cmup: newCmup,
        marginPercent
      },
      message: `Mouvement de stock (${type}) enregistré avec mise à jour du CMUP (${newCmup} FCFA).`
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erreur lors du mouvement de stock' });
  }
});

// GET /api/stocks/movements
router.get('/movements', async (req: Request, res: Response) => {
  const companyId = Number((req as any).auth?.companyId);
  if (!companyId) return res.status(403).json({ error: 'Contexte entreprise manquant' });

  try {
    const movements = await pgService.getStockMovements(companyId);
    res.json({
      movements,
      total: movements.length
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erreur lors du chargement des mouvements de stock' });
  }
});

// GET /api/stocks/inventory-records
router.get('/inventory-records', async (req: Request, res: Response) => {
  const companyId = Number((req as any).auth?.companyId);
  if (!companyId) return res.status(403).json({ error: 'Contexte entreprise manquant' });

  try {
    const records = await pgService.getInventoryRecords(companyId);
    res.json({ records, total: records.length });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erreur lors du chargement des inventaires' });
  }
});

// POST /api/stocks/inventory-reconciliation (Inventaire physique contradictoire)
router.post('/inventory-reconciliation', async (req: Request, res: Response) => {
  const companyId = Number((req as any).auth?.companyId);
  if (!companyId) return res.status(403).json({ error: 'Contexte entreprise manquant' });

  const { productId, physicalStock, notes } = req.body;

  try {
    const record = await pgService.recordInventoryReconciliation({
      productId,
      physicalStock,
      notes
    }, companyId);

    if (!record) {
      return res.status(404).json({ error: 'Produit introuvable' });
    }

    if (record.status === 'ECART_CRITIQUE') {
      await pgService.createFraudAlert({
        type: 'STOCK_DISCREPANCY',
        severity: 'CRITIQUE',
        title: `Écart de stock critique sur ${record.productName}`,
        description: `Perte/Manquant physique de ${Math.abs(record.variance)} unités valorisé à ${Math.abs(record.varianceValueFCFA)} FCFA.`,
        amount: Math.abs(record.varianceValueFCFA),
        entityId: String(productId),
        entityType: 'PRODUCT'
      }, companyId);
    }

    res.status(201).json({
      record,
      adjustedStock: record.physicalStock,
      message: `Inventaire consigné. Écart de ${record.variance} unités enregistré dans Supabase.`
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erreur lors de la réconciliation d\'inventaire' });
  }
});

export default router;
