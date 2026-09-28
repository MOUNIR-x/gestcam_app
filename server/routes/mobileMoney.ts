import { Router, Request, Response } from 'express';
import { db, MobileMoneyPayment } from '../data/store';
import { pgService } from '../services/pgService.js';

const router = Router();
const WEBHOOK_TOKEN = process.env.MOBILE_WEBHOOK_TOKEN || '';

// GET /api/mobile-money/payments
router.get('/payments', (req: Request, res: Response) => {
  res.json({
    payments: db.mobileMoneyPayments,
    total: db.mobileMoneyPayments.length
  });
});

// POST /api/mobile-money/collect
// Initiates an instant Push USSD prompt to customer's mobile phone (MTN or Orange)
router.post('/collect', (req: Request, res: Response) => {
  const { invoiceId, phoneNumber, operator, amount } = req.body;

  if (!phoneNumber || !amount) {
    return res.status(400).json({ error: 'Numéro de téléphone et montant requis.' });
  }

  // Validate Cameroon phone numbers (format +237 6xx xx xx xx or 6xx xx xx xx)
  const cleaned = phoneNumber.replace(/[\s\-\+]/g, '');
  const isCmNumber = cleaned.startsWith('237') ? cleaned.length === 12 : cleaned.length === 9;
  if (!isCmNumber) {
    return res.status(400).json({
      error: 'Numéro invalide. Veuillez saisir un numéro camerounais valide (ex: 677 82 91 00 ou 699 12 34 56).'
    });
  }

  const op = operator || (cleaned.includes('67') || cleaned.includes('68') || cleaned.includes('650') || cleaned.includes('651') || cleaned.includes('652') || cleaned.includes('653') || cleaned.includes('654') ? 'MTN_MOMO' : 'ORANGE_MONEY');

  const txId = `TX-${op === 'MTN_MOMO' ? 'MOMO' : 'OM'}-${Date.now().toString().slice(-6)}`;
  const ref = `PAY-CM-${Date.now().toString().slice(-4)}`;

  // For safety, mark as PENDING and wait for external webhook confirmation
  const payment: MobileMoneyPayment = {
    transactionId: txId,
    reference: ref,
    operator: op,
    phoneNumber,
    amount: Number(amount),
    invoiceId: invoiceId || '',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    confirmedAt: null
  };

  db.mobileMoneyPayments.unshift(payment);
  // Persist to SQL asynchronously (best effort)
  pgService.createMobileMoneyPayment({ ...payment }).catch(() => {});

  res.status(201).json({
    success: true,
    payment,
    message: `Demande de paiement initiée (${amount} FCFA). En attente de confirmation.`
  });
});

// POST /api/mobile-money/webhook (Simulation of external MTN MoMo / Orange Money callback)
export const webhookHandler = (req: Request, res: Response) => {
  const token = req.headers['x-webhook-token'] as string | undefined;
  if (WEBHOOK_TOKEN && token !== WEBHOOK_TOKEN) {
    return res.status(401).json({ error: 'Webhook token invalid' });
  }

  const { transactionId, status, externalReference } = req.body;

  const payment = db.mobileMoneyPayments.find(p => p.transactionId === transactionId || p.reference === externalReference);
  if (!payment) {
    return res.status(404).json({ error: 'Transaction Mobile Money introuvable' });
  }

  // Idempotency: ignore if already SUCCESSFUL or FAILED
  if (payment.status === 'SUCCESSFUL' || payment.status === 'FAILED') {
    return res.json({ received: true, paymentStatus: payment.status, idempotent: true });
  }

  payment.status = status === 'SUCCESSFUL' ? 'SUCCESSFUL' : 'FAILED';
  payment.confirmedAt = new Date().toISOString();

  // If successful and linked to an invoice, settle and record treasury (single server-side commit)
  if (payment.status === 'SUCCESSFUL' && payment.invoiceId) {
    const inv = db.invoices.find(i => i.id === payment.invoiceId || i.invoiceNumber === payment.invoiceId);
    if (inv) {
      inv.status = 'PAYEE';
      inv.paymentMethod = payment.operator;

      const client = db.clients.find(c => c.id === inv.clientId);
      if (client) {
        client.outstandingBalance = Math.max(0, client.outstandingBalance - inv.netAPayer);
      }

      const refNum = payment.reference;
      db.recordPaymentInTreasury(
        payment.operator,
        inv.netAPayer,
        `Paiement ${payment.operator === 'MTN_MOMO' ? 'MTN MoMo' : 'Orange Money'} Facture ${inv.invoiceNumber} (${payment.phoneNumber})`,
        refNum
      );

      // Persist treasury to Postgres as best effort
      pgService.recordTreasuryTransaction({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        accountName: payment.operator === 'MTN_MOMO' ? 'MTN Mobile Money' : 'Orange Money',
        channel: payment.operator,
        type: 'ENTREE',
        category: 'VENTES',
        amount: inv.netAPayer,
        description: `Paiement ${payment.operator === 'MTN_MOMO' ? 'MTN MoMo' : 'Orange Money'} Facture ${inv.invoiceNumber}`,
        referenceNumber: payment.reference,
        status: 'COMPLETE'
      }).catch(() => {});
    }
  }

  res.json({
    received: true,
    paymentStatus: payment.status
  });
};

export default router;

export default router;
