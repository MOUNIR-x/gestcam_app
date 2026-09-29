import { Router, Request, Response } from 'express';
import { pgService } from '../services/pgService.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();
const WEBHOOK_TOKEN = process.env.MOBILE_WEBHOOK_TOKEN;

// Protect collect/payments endpoints; webhook is exported separately and should be mounted without auth.
router.use(authMiddleware);

// GET /api/mobile-money/payments
router.get('/payments', async (req: Request, res: Response) => {
  const companyId = Number((req as any).auth?.companyId);
  if (!companyId) return res.status(403).json({ error: 'Contexte entreprise manquant' });

  try {
    const payments = await pgService.getMobileMoneyPayments(companyId);
    res.json({
      payments,
      total: payments.length
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erreur lors du chargement des paiements' });
  }
});

// POST /api/mobile-money/collect
// Initiates an instant Push USSD prompt to customer's mobile phone (MTN or Orange)
router.post('/collect', async (req: Request, res: Response) => {
  const companyId = Number((req as any).auth?.companyId);
  if (!companyId) return res.status(403).json({ error: 'Contexte entreprise manquant' });

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

  const paymentData = {
    transactionId: txId,
    reference: ref,
    operator: op,
    phoneNumber,
    amount: Number(amount),
    invoiceId: invoiceId ? String(invoiceId) : null,
    status: 'PENDING'
  };

  try {
    const inserted = await pgService.createMobileMoneyPayment(paymentData, companyId);
    res.status(201).json({
      success: true,
      payment: inserted,
      message: `Demande de paiement initiée (${amount} FCFA). En attente de confirmation.`
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erreur lors de l\'initiation du paiement' });
  }
});

// POST /api/mobile-money/webhook (Simulation of external MTN MoMo / Orange Money callback)
export const webhookHandler = async (req: Request, res: Response) => {
  const token = req.headers['x-webhook-token'] as string | undefined;
  if (!WEBHOOK_TOKEN || !token || token !== WEBHOOK_TOKEN) {
    return res.status(401).json({ error: 'Webhook token invalid' });
  }

  const { transactionId, status, externalReference } = req.body;

  try {
    const payment = await pgService.findMobileMoneyPayment(transactionId || externalReference);
    if (!payment) {
      return res.status(404).json({ error: 'Transaction Mobile Money introuvable' });
    }

    // Idempotency: ignore if already SUCCESSFUL or FAILED
    if (payment.status === 'SUCCESSFUL' || payment.status === 'FAILED') {
      return res.json({ received: true, paymentStatus: payment.status, idempotent: true });
    }

    const newStatus = status === 'SUCCESSFUL' ? 'SUCCESSFUL' : 'FAILED';
    await pgService.updateMobileMoneyPayment(payment.transactionId, newStatus);

    // If successful and linked to an invoice, settle invoice and record treasury in Supabase
    if (newStatus === 'SUCCESSFUL' && payment.invoiceId) {
      const companyId = payment.companyId ? Number(payment.companyId) : undefined;
      const inv = await pgService.getInvoiceById(payment.invoiceId, companyId);

      if (inv) {
        await pgService.updateInvoiceStatus(inv.id, 'PAYEE', payment.operator, companyId);

        // Record in treasury
        await pgService.recordTreasuryTransaction({
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          accountName: payment.operator === 'MTN_MOMO' ? 'MTN Mobile Money' : 'Orange Money',
          channel: payment.operator,
          type: 'ENTREE',
          category: 'Vente Client',
          amount: inv.netAPayer,
          description: `Paiement ${payment.operator === 'MTN_MOMO' ? 'MTN MoMo' : 'Orange Money'} Facture ${inv.invoiceNumber} (${payment.phoneNumber})`,
          referenceNumber: payment.reference,
          status: 'COMPLETE'
        }, companyId);
      }
    }

    res.json({
      received: true,
      paymentStatus: newStatus
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erreur lors du traitement du webhook' });
  }
};

export default router;
