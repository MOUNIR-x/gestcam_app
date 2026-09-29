import { Router } from 'express';
import { pgService } from '../services/pgService.js';

const router = Router();

// GET /api/employees — liste des employés du tenant
router.get('/', async (req, res) => {
  try {
    const auth = (req as any).auth;
    const companyId = Number(auth?.companyId);
    if (!companyId) return res.status(400).json({ error: 'companyId manquant dans le token' });

    const employees = await pgService.getEmployees(companyId);
    return res.json({ employees });
  } catch (err: any) {
    console.error('[GET /api/employees]', err?.message);
    return res.status(500).json({ error: 'Erreur lors du chargement des employés' });
  }
});

// POST /api/employees — créer un employé
router.post('/', async (req, res) => {
  try {
    const auth = (req as any).auth;
    const companyId = Number(auth?.companyId);
    if (!companyId) return res.status(400).json({ error: 'companyId manquant dans le token' });

    const data = req.body;
    if (!data?.lastName || !data?.firstName) {
      return res.status(400).json({ error: 'Les champs "firstName" et "lastName" sont obligatoires' });
    }

    const employee = await pgService.createEmployee(data, companyId);
    return res.status(201).json({ employee, message: 'Employé créé avec succès' });
  } catch (err: any) {
    console.error('[POST /api/employees]', err?.message);
    return res.status(500).json({ error: 'Erreur lors de la création de l\'employé' });
  }
});

// PATCH /api/employees/:id/attendance — mise à jour de la présence
router.patch('/:id/attendance', async (req, res) => {
  try {
    const auth = (req as any).auth;
    const companyId = Number(auth?.companyId);
    const { id } = req.params;
    const { attendance } = req.body;

    if (!attendance) return res.status(400).json({ error: 'Le champ "attendance" est obligatoire' });

    const updated = await pgService.updateEmployeeAttendance(id, attendance, companyId || undefined);
    if (!updated) return res.status(404).json({ error: 'Employé non trouvé' });
    return res.json({ employee: updated, message: 'Présence mise à jour' });
  } catch (err: any) {
    console.error('[PATCH /api/employees/:id/attendance]', err?.message);
    return res.status(500).json({ error: 'Erreur lors de la mise à jour de la présence' });
  }
});

export default router;
