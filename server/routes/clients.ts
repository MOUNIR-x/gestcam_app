import { Router } from 'express';
import { pgService } from '../services/pgService.js';

const router = Router();

// GET /api/clients — liste des clients du tenant
router.get('/', async (req, res) => {
  try {
    const auth = (req as any).auth;
    const companyId = Number(auth?.companyId);
    if (!companyId) return res.status(400).json({ error: 'companyId manquant dans le token' });

    const clients = await pgService.getClients(companyId);
    return res.json({ clients });
  } catch (err: any) {
    console.error('[GET /api/clients]', err?.message);
    return res.status(500).json({ error: 'Erreur lors du chargement des clients' });
  }
});

// POST /api/clients — créer un client
router.post('/', async (req, res) => {
  try {
    const auth = (req as any).auth;
    const companyId = Number(auth?.companyId);
    if (!companyId) return res.status(400).json({ error: 'companyId manquant dans le token' });

    const data = req.body;
    if (!data?.name) return res.status(400).json({ error: 'Le champ "name" est obligatoire' });

    const client = await pgService.createClient(data, companyId);
    return res.status(201).json({ client, message: 'Client créé avec succès' });
  } catch (err: any) {
    console.error('[POST /api/clients]', err?.message);
    return res.status(500).json({ error: 'Erreur lors de la création du client' });
  }
});

export default router;
