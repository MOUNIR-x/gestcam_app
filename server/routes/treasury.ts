import { Router, Request, Response } from 'express';
import authMiddleware from '../middleware/auth.js';
import { pgService } from '../services/pgService.js';

const router = Router();

// Protect treasury endpoints
router.use(authMiddleware);

// GET /api/treasury/overview
router.get('/overview', async (req: Request, res: Response) => {
  const companyId = Number((req as any).auth?.companyId);
  if (!companyId) return res.status(403).json({ error: 'Contexte entreprise manquant' });

  try {
    const [accounts, recentTransactions, fraudAlerts] = await Promise.all([
      pgService.getTreasuryAccounts(companyId),
      pgService.getTreasuryTransactions(companyId),
      pgService.getFraudAlerts(companyId)
    ]);

    const totalBalance = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
    const totalInflowToday = accounts.reduce((sum, a) => sum + (Number(a.todayInflow) || 0), 0);
    const totalOutflowToday = accounts.reduce((sum, a) => sum + (Number(a.todayOutflow) || 0), 0);

    res.json({
      totalBalance,
      totalInflowToday,
      totalOutflowToday,
      accounts,
      recentTransactions: recentTransactions.slice(0, 15),
      fraudAlerts: fraudAlerts.filter(a => !a.resolved)
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erreur lors du chargement de la trésorerie' });
  }
});

// POST /api/treasury/transactions
router.post('/transactions', async (req: Request, res: Response) => {
  const companyId = Number((req as any).auth?.companyId);
  if (!companyId) return res.status(403).json({ error: 'Contexte entreprise manquant' });

  const {
    accountId,
    channel,
    type,
    category,
    amount,
    description,
    referenceNumber
  } = req.body;

  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ error: 'Le montant de la transaction doit être supérieur à zéro.' });
  }

  try {
    const accounts = await pgService.getTreasuryAccounts(companyId);
    const account = accounts.find(a => String(a.id) === String(accountId) || a.type === channel);

    if (!account) {
      return res.status(404).json({ error: 'Compte de trésorerie introuvable' });
    }

    if (type === 'SORTIE' && account.balance < numAmount) {
      return res.status(400).json({
        error: `Solde insuffisant sur le compte ${account.name} (Solde disponible: ${account.balance} FCFA)`
      });
    }

    const ref = referenceNumber || `REF-${Date.now().toString().slice(-6)}`;
    const newTx = {
      accountId: account.id,
      accountName: account.name,
      channel: account.type,
      type,
      category: category || (type === 'ENTREE' ? 'Recette Vente' : 'Dépense Exploitation'),
      amount: numAmount,
      description: description || `Opération de trésorerie ${type}`,
      referenceNumber: ref,
      status: 'COMPLETE'
    };

    const inserted = await pgService.recordTreasuryTransaction(newTx, companyId);
    const updatedAccounts = await pgService.getTreasuryAccounts(companyId);
    const updatedAccount = updatedAccounts.find(a => a.id === account.id) || account;

    res.status(201).json({
      transaction: inserted,
      updatedAccount,
      message: `Opération de trésorerie enregistrée (${numAmount} FCFA)`
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erreur lors de l\'enregistrement de la transaction' });
  }
});

// POST /api/treasury/alerts/:id/resolve
router.post('/alerts/:id/resolve', async (req: Request, res: Response) => {
  const companyId = Number((req as any).auth?.companyId);
  if (!companyId) return res.status(403).json({ error: 'Contexte entreprise manquant' });

  try {
    const resolved = await pgService.resolveFraudAlert(req.params.id, companyId);
    res.json({
      resolvedAlert: resolved,
      message: 'Alerte d\'audit régularisée et archivée avec succès'
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erreur lors de la résolution de l\'alerte' });
  }
});

export default router;
