import { Router } from 'express';
import { pgService } from '../services/pgService.js';

const router = Router();

// GET /api/purchase-orders — liste des bons de commande du tenant
router.get('/', async (req, res) => {
  try {
    const auth = (req as any).auth;
    const companyId = Number(auth?.companyId);
    if (!companyId) return res.status(400).json({ error: 'companyId manquant dans le token' });

    const purchaseOrders = await pgService.getPurchaseOrders(companyId);
    return res.json({ purchaseOrders });
  } catch (err: any) {
    console.error('[GET /api/purchase-orders]', err?.message);
    return res.status(500).json({ error: 'Erreur lors du chargement des bons de commande' });
  }
});

// POST /api/purchase-orders — créer un bon de commande
router.post('/', async (req, res) => {
  try {
    const auth = (req as any).auth;
    const companyId = Number(auth?.companyId);
    if (!companyId) return res.status(400).json({ error: 'companyId manquant dans le token' });

    const data = req.body;
    if (!data?.supplierName) {
      return res.status(400).json({ error: 'Le champ "supplierName" est obligatoire' });
    }

    // Génération du numéro BC avec le compte actuel des bons du tenant
    const existingOrders = await pgService.getPurchaseOrders(companyId);
    const seq = existingOrders.length + 1;
    const year = new Date().getFullYear();
    data.orderNumber = data.orderNumber || `BC-${year}-${seq.toString().padStart(4, '0')}`;

    const purchaseOrder = await pgService.createPurchaseOrder(data, companyId);
    return res.status(201).json({ purchaseOrder, message: 'Bon de commande créé avec succès' });
  } catch (err: any) {
    console.error('[POST /api/purchase-orders]', err?.message);
    return res.status(500).json({ error: 'Erreur lors de la création du bon de commande' });
  }
});

export default router;
