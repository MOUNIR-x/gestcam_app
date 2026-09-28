import { Router, Request, Response } from 'express';
import { signToken } from '../middleware/auth.js';
import { pgService } from '../services/pgService.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

const router = Router();

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  const auth = (req as any).auth || null;
  if (!auth || !auth.userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = await pgService.getUserById(Number(auth.userId));
    const company = auth.companyId ? await pgService.getCompanyById(Number(auth.companyId)) : await pgService.getCompanyForUser(Number(auth.userId));
    return res.json({ user, company, authenticated: true, auth });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load profile' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

  // If ADMIN credentials are configured, validate against them
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Identifiants invalides' });
    // for admin, try to find a linked user/company
    try {
      const user = await pgService.findUserByEmail(email);
      const company = user ? await pgService.getCompanyForUser(user.id) : null;
      const token = signToken({ email, userId: user?.id || null, companyId: company?.id || null });
      return res.json({ token, user, company, message: 'Connexion admin réussie' });
    } catch (e) {
      return res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
  }

  try {
    const user = await pgService.findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé. Veuillez vous inscrire.' });
    const company = await pgService.getCompanyForUser(user.id);
    const token = signToken({ email, userId: user.id, companyId: company?.id || null });
    return res.json({ token, user, company, message: 'Connexion réussie' });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
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

  if (!companyName || !phone || !email) {
    return res.status(400).json({ error: 'Le nom de l\'entreprise, le téléphone et l\'email sont obligatoires.' });
  }

  if (niu && niu.trim().length > 0 && niu.trim().length < 8) {
    return res.status(400).json({ error: 'Le NIU (Numéro d\'Identifiant Unique) est invalide.' });
  }

  try {
    // prevent duplicate users
    const existing = await pgService.findUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'Un utilisateur avec cet email existe déjà. Veuillez vous connecter.' });

    const user = await pgService.createUser({ email, name: managerName, companyName });
    if (!user) return res.status(500).json({ error: 'Impossible de créer l\'utilisateur' });

    const company = await pgService.createCompanyForUser({
      name: companyName,
      commercialName,
      niu,
      rccm,
      cdi,
      regime,
      city,
      phone,
      email
    }, user.id);

    const token = signToken({ email: user.email, userId: user.id, companyId: company?.id || null });
    return res.status(201).json({ token, user, company, message: 'Compte PME créé avec succès. Bienvenue sur GestCam !' });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
});

// PUT /api/auth/company
router.put('/company', async (req: Request, res: Response) => {
  const auth = (req as any).auth || null;
  if (!auth || !auth.userId) return res.status(401).json({ error: 'Unauthorized' });
  const updates = req.body;
  try {
    const updated = await pgService.updateCompanyForUser(Number(auth.userId), updates);
    if (!updated) return res.status(404).json({ error: 'Company not found for user' });
    return res.json({ company: updated, message: 'Paramètres fiscaux et informations d\'entreprise mis à jour' });
  } catch (e) {
    return res.status(500).json({ error: 'Impossible de mettre à jour la company' });
  }
});

export default router;
