import { Router, Request, Response } from 'express';
import { db, MobileMoneyPayment } from '../data/store';
import { pgService } from '../services/pgService.js';

const router = Router();

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

  const payment: MobileMoneyPayment = {
    transactionId: txId,
    reference: ref,
    operator: op,
    phoneNumber,
    amount: Number(amount),
    invoiceId: invoiceId || '',
    status: 'SUCCESSFUL', // Immediate confirmation for demo/sandbox simulation
    createdAt: new Date().toISOString(),
    confirmedAt: new Date().toISOString()
  };

  db.mobileMoneyPayments.unshift(payment);

  // If connected to an invoice, auto-settle the invoice
  if (invoiceId) {
    const inv = db.invoices.find(i => i.id === invoiceId || i.invoiceNumber === invoiceId);
    if (inv) {
      inv.status = 'PAYEE';
      inv.paymentMethod = op;
      
      // Update client balance
      const client = db.clients.find(c => c.id === inv.clientId);
      if (client) {
        client.outstandingBalance = Math.max(0, client.outstandingBalance - inv.netAPayer);
      }

      // Record in treasury
      db.recordPaymentInTreasury(
        op,
        inv.netAPayer,
        `Paiement ${op === 'MTN_MOMO' ? 'MTN MoMo' : 'Orange Money'} Facture ${inv.invoiceNumber} (${phoneNumber})`,
        ref
      );

      // Async sync to PostgreSQL
      pgService.recordTreasuryTransaction({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        accountName: op === 'MTN_MOMO' ? 'MTN Mobile Money' : 'Orange Money',
        channel: op,
        type: 'ENTREE',
        category: 'VENTES',
        amount: inv.netAPayer,
        description: `Paiement ${op === 'MTN_MOMO' ? 'MTN MoMo' : 'Orange Money'} Facture ${inv.invoiceNumber}`,
        referenceNumber: ref,
        status: 'COMPLETE'
      }).catch(() => {});
    }
  } else {
    // Standalone direct payment
    db.recordPaymentInTreasury(
      op,
      Number(amount),
      `Encaissement direct ${op === 'MTN_MOMO' ? 'MTN MoMo' : 'Orange Money'} (${phoneNumber})`,
      ref
    );

    // Async sync to PostgreSQL
    pgService.recordTreasuryTransaction({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      accountName: op === 'MTN_MOMO' ? 'MTN Mobile Money' : 'Orange Money',
      channel: op,
      type: 'ENTREE',
      category: 'VENTES',
      amount: Number(amount),
      description: `Encaissement direct ${op === 'MTN_MOMO' ? 'MTN MoMo' : 'Orange Money'} (${phoneNumber})`,
      referenceNumber: ref,
      status: 'COMPLETE'
    }).catch(() => {});
  }

  res.status(201).json({
    success: true,
    payment,
    message: `Paiement ${op === 'MTN_MOMO' ? 'MTN Mobile Money' : 'Orange Money'} validé avec succès (${amount} FCFA) !`
  });
});

// POST /api/mobile-money/webhook (Simulation of external MTN MoMo / Orange Money callback)
router.post('/webhook', (req: Request, res: Response) => {
  const { transactionId, status, externalReference } = req.body;

  const payment = db.mobileMoneyPayments.find(p => p.transactionId === transactionId || p.reference === externalReference);
  if (!payment) {
    return res.status(404).json({ error: 'Transaction Mobile Money introuvable' });
  }

  payment.status = status === 'SUCCESSFUL' ? 'SUCCESSFUL' : 'FAILED';
  payment.confirmedAt = new Date().toISOString();

  res.json({
    received: true,
    paymentStatus: payment.status
  });
});

export default router;
