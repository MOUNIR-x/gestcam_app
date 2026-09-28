import { Router, Request, Response } from 'express';
import { db } from '../data/store';
import { signToken } from '../middleware/auth.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

const router = Router();

// GET /api/auth/me
router.get('/me', (req: Request, res: Response) => {
  const auth = (req as any).auth || null;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  res.json({
    user: db.user,
    company: db.company,
    authenticated: true,
    auth
  });
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  // If ADMIN credentials are configured, validate against them
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
  }

  const token = signToken({ email });
  res.json({
    token,
    user: db.user,
    company: db.company,
    message: 'Connexion réussie à GestCam Cameroun'
  });
});

// POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
  const {
    companyName,
    commercialName,
    niu,
    rccm,
    cdi,
    regime,
    city,
    phone,
    email,
    businessType,
    managerName
  } = req.body;

  if (!companyName || !phone) {
    return res.status(400).json({ error: 'Le nom de l\'entreprise et le téléphone sont obligatoires.' });
  }

  // Validate NIU format if provided (Cameroon standard: alphanumeric 14 characters)
  if (niu && niu.trim().length > 0 && niu.trim().length < 8) {
    return res.status(400).json({ error: 'Le NIU (Numéro d\'Identifiant Unique) est invalide.' });
  }

  db.company = {
    ...db.company,
    name: companyName,
    commercialName: commercialName || companyName,
    niu: niu || 'M032600129381A',
    rccm: rccm || 'RC/DLA/2026/B/890',
    cdi: cdi || 'CDI Akwa Douala',
    regime: regime === 'SIMPLIFIE' ? 'SIMPLIFIE' : 'REEL',
    city: city || 'Douala',
    phone: phone,
    email: email || db.company.email
  };

  if (managerName) {
    db.user.name = managerName;
  }
  if (email) {
    db.user.email = email;
  }
  db.user.companyName = companyName;

  const token = `gestcam_jwt_${Date.now()}`;
  res.status(201).json({
    token,
    user: db.user,
    company: db.company,
    message: 'Compte PME créé avec succès. Bienvenue sur GestCam !'
  });
});

// PUT /api/auth/company
router.put('/company', (req: Request, res: Response) => {
  const updates = req.body;
  db.company = {
    ...db.company,
    ...updates
  };
  res.json({
    company: db.company,
    message: 'Paramètres fiscaux et informations d\'entreprise mis à jour'
  });
});

export default router;
