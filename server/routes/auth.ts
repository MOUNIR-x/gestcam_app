import { Router, Request, Response } from 'express';
import authMiddleware, { signToken } from '../middleware/auth.js';
import { pgService } from '../services/pgService.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const router = Router();

// This router is mounted before the global /api middleware.
router.use(['/me', '/company'], authMiddleware);

router.get('/me', async (req: Request, res: Response) => {
  const auth = (req as any).auth;
  if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = await pgService.getUserById(Number(auth.userId));
    const company = await pgService.getCompanyForUser(Number(auth.userId));
    return res.json({ user, company, authenticated: true });
  } catch {
    return res.status(500).json({ error: 'Failed to load profile' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  try {
    if (ADMIN_EMAIL && ADMIN_PASSWORD && email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const user = await pgService.findUserByEmail(email);
      const company = user ? await pgService.getCompanyForUser(user.id) : null;
      return res.json({ token: signToken({ email, userId: user?.id || null, companyId: company?.id || null }), user, company });
    }
    const user = await pgService.findUserByEmail(email);
    if (!user || !await pgService.verifyPassword(user.passwordHash, String(password))) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }
    const company = await pgService.getCompanyForUser(user.id);
    return res.json({ token: signToken({ email: user.email, userId: user.id, companyId: company?.id || null }), user, company });
  } catch {
    return res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  const { companyName, commercialName, niu, rccm, cdi, regime, city, phone, email, managerName, password } = req.body;
  if (!companyName || !phone || !email || !password || String(password).length < 12) {
    return res.status(400).json({ error: 'Entreprise, téléphone, email et mot de passe de 12 caractères minimum sont requis.' });
  }
  if (niu && String(niu).trim().length > 0 && String(niu).trim().length < 8) return res.status(400).json({ error: 'Le NIU est invalide.' });
  try {
    if (await pgService.findUserByEmail(email)) return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    const user = await pgService.createUser({ email, name: managerName, companyName, passwordHash: await pgService.hashPassword(String(password)) });
    if (!user) return res.status(500).json({ error: 'Impossible de créer l’utilisateur.' });
    const company = await pgService.createCompanyForUser({ name: companyName, commercialName, niu, rccm, cdi, regime, city, phone, email }, user.id);
    return res.status(201).json({ token: signToken({ email: user.email, userId: user.id, companyId: company?.id || null }), user, company });
  } catch {
    return res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
});

router.put('/company', async (req: Request, res: Response) => {
  const auth = (req as any).auth;
  if (!auth?.userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const updated = await pgService.updateCompanyForUser(Number(auth.userId), req.body);
    if (!updated) return res.status(404).json({ error: 'Company not found' });
    return res.json({ company: updated, message: 'Paramètres mis à jour' });
  } catch {
    return res.status(500).json({ error: 'Impossible de mettre à jour l’entreprise' });
  }
});

export default router;
