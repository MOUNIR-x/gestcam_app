import { Router, Request, Response } from 'express';
import { db } from '../data/store';
import authMiddleware from '../middleware/auth.js';
import { TreasuryTransaction } from '../../src/types/index';
import { pgService } from '../services/pgService.js';

const router = Router();

// Protect treasury endpoints
router.use(authMiddleware);

// GET /api/treasury/overview
router.get('/overview', async (req: Request, res: Response) => {
  const [pgAccounts, pgTxs] = await Promise.all([
    pgService.getTreasuryAccounts(),
    pgService.getTreasuryTransactions()
  ]);
  const accounts = (pgAccounts && pgAccounts.length > 0) ? pgAccounts : db.treasuryAccounts;
  const recentTransactions = (pgTxs && pgTxs.length > 0) ? pgTxs.slice(0, 15) : db.treasuryTransactions.slice(0, 15);

  const totalBalance = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  const totalInflowToday = accounts.reduce((sum, a) => sum + (Number(a.todayInflow) || 0), 0);
  const totalOutflowToday = accounts.reduce((sum, a) => sum + (Number(a.todayOutflow) || 0), 0);

  res.json({
    totalBalance,
    totalInflowToday,
    totalOutflowToday,
    accounts,
    recentTransactions,
    fraudAlerts: db.fraudAlerts
  });
});

// POST /api/treasury/transactions
router.post('/transactions', (req: Request, res: Response) => {
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

  const account = db.treasuryAccounts.find(a => a.id === accountId || a.type === channel);
  if (!account) {
    return res.status(404).json({ error: 'Compte de trésorerie introuvable' });
  }

  if (type === 'SORTIE' && account.balance < numAmount) {
    return res.status(400).json({
      error: `Solde insuffisant sur le compte ${account.name} (Solde disponible: ${account.balance} FCFA)`
    });
  }

  const ref = referenceNumber || `REF-${Date.now().toString().slice(-6)}`;
  const newTx: TreasuryTransaction = {
    id: `tx_${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
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

  const delta = type === 'ENTREE' ? numAmount : -numAmount;
  account.balance += delta;
  if (type === 'ENTREE') {
    account.todayInflow += numAmount;
  } else {
    account.todayOutflow += numAmount;
  }

  db.treasuryTransactions.unshift(newTx);
  pgService.recordTreasuryTransaction(newTx).catch(() => {});

  res.status(201).json({
    transaction: newTx,
    updatedAccount: account,
    message: `Opération de trésorerie enregistrée (${numAmount} FCFA)`
  });
});

// POST /api/treasury/alerts/:id/resolve
router.post('/alerts/:id/resolve', (req: Request, res: Response) => {
  const alertIndex = db.fraudAlerts.findIndex(a => a.id === req.params.id);
  if (alertIndex === -1) {
    return res.status(404).json({ error: 'Alerte introuvable' });
  }
  const resolved = db.fraudAlerts.splice(alertIndex, 1)[0];
  res.json({
    resolvedAlert: resolved,
    message: 'Alerte d\'audit régularisée et archivée avec succès'
  });
});

export default router;
