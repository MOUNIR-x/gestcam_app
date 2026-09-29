import { Router } from 'express';
import { pgService } from '../services/pgService.js';

const router = Router();

// GET /api/suppliers — liste des fournisseurs du tenant
router.get('/', async (req, res) => {
  try {
    const auth = (req as any).auth;
    const companyId = Number(auth?.companyId);
    if (!companyId) return res.status(400).json({ error: 'companyId manquant dans le token' });

    const suppliers = await pgService.getSuppliers(companyId);
    return res.json({ suppliers });
  } catch (err: any) {
    console.error('[GET /api/suppliers]', err?.message);
    return res.status(500).json({ error: 'Erreur lors du chargement des fournisseurs' });
  }
});

// POST /api/suppliers — créer un fournisseur
router.post('/', async (req, res) => {
  try {
    const auth = (req as any).auth;
    const companyId = Number(auth?.companyId);
    if (!companyId) return res.status(400).json({ error: 'companyId manquant dans le token' });

    const data = req.body;
    if (!data?.name) return res.status(400).json({ error: 'Le champ "name" est obligatoire' });

    const supplier = await pgService.createSupplier(data, companyId);
    return res.status(201).json({ supplier, message: 'Fournisseur créé avec succès' });
  } catch (err: any) {
    console.error('[POST /api/suppliers]', err?.message);
    return res.status(500).json({ error: 'Erreur lors de la création du fournisseur' });
  }
});

export default router;
