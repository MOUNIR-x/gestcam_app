import { Router, Request, Response } from 'express';
import { db } from '../data/store';
import { Invoice, InvoiceItem } from '../../src/types/index';
import { pgService } from '../services/pgService.js';

const router = Router();

// GET /api/invoices
router.get('/', async (req: Request, res: Response) => {
  const { status, clientId, search } = req.query;
  const pgInvs = await pgService.getInvoices();
  let list = (pgInvs && pgInvs.length > 0) ? [...pgInvs] : [...db.invoices];

  if (status && status !== 'TOUTES') {
    list = list.filter(i => i.status === status);
  }

  if (clientId) {
    list = list.filter(i => String(i.clientId) === String(clientId));
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(i => 
      i.invoiceNumber.toLowerCase().includes(q) ||
      i.clientName.toLowerCase().includes(q) ||
      (i.clientNIU && i.clientNIU.toLowerCase().includes(q))
    );
  }

  res.json({
    invoices: list,
    totalCount: list.length,
    summary: {
      totalHT: list.reduce((s, i) => s + i.totalHT, 0),
      totalTTC: list.reduce((s, i) => s + i.totalTTC, 0),
      totalNetAPayer: list.reduce((s, i) => s + i.netAPayer, 0),
      paidCount: list.filter(i => i.status === 'PAYEE').length,
      pendingCount: list.filter(i => i.status === 'EN_ATTENTE').length,
      overdueCount: list.filter(i => i.status === 'EN_RETARD').length
    }
  });
});

// GET /api/invoices/:id
router.get('/:id', (req: Request, res: Response) => {
  const invoice = db.invoices.find(i => i.id === req.params.id);
  if (!invoice) {
    return res.status(404).json({ error: 'Facture introuvable' });
  }
  res.json(invoice);
});

// POST /api/invoices/calculate (Tax engine preview)
router.post('/calculate', (req: Request, res: Response) => {
  const { items, applyTva = true, applyAcompte = true, clientNIU } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Liste d\'articles requise' });
  }

  const totalHT = items.reduce((sum: number, it: any) => {
    const q = Number(it.quantity) || 0;
    const p = Number(it.unitPriceHT) || 0;
    return sum + (q * p);
  }, 0);

  // OHADA Cameroon TVA rate: 19.25% (17.5% + 10% CAC)
  const tvaRate = applyTva && db.company.enableTva ? db.company.tvaRate : 0;
  const tvaAmount = Math.round(totalHT * tvaRate);
  const totalTTC = totalHT + tvaAmount;

  // Acompte AIRS: 2.2% if client has valid NIU, 5.5% if unmatriculated
  const hasValidNIU = clientNIU && clientNIU.trim().length >= 8;
  const effectiveAcompteRate = applyAcompte && db.company.enableAcompte 
    ? (hasValidNIU ? db.company.acompteRate : 0.055) 
    : 0;
  const acompteAmount = Math.round(totalHT * effectiveAcompteRate);

  const netAPayer = totalTTC - acompteAmount;

  res.json({
    totalHT,
    tvaRate,
    tvaAmount,
    totalTTC,
    acompteRate: effectiveAcompteRate,
    acompteAmount,
    netAPayer,
    isUnregisteredClient: !hasValidNIU,
    notes: !hasValidNIU && applyAcompte 
      ? 'Acompte AIRS majoré à 5.5% (Client sans NIU immatriculé - Code Général des Impôts)'
      : 'Taux standards OHADA Cameroun appliqués (TVA 19.25% et AIRS 2.2%)'
  });
});

// POST /api/invoices
router.post('/', (req: Request, res: Response) => {
  const {
    clientId,
    clientName,
    clientNIU,
    clientPhone,
    clientCity,
    items,
    dueDate,
    applyTva = true,
    applyAcompte = true,
    paymentMethod = 'ESPECES',
    status = 'EN_ATTENTE',
    notes
  } = req.body;

  if (!clientName || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Client et articles requis pour émettre une facture.' });
  }

  // Compute calculated amounts
  const computedItems: InvoiceItem[] = items.map((it: any, index: number) => {
    const q = Number(it.quantity) || 1;
    const p = Number(it.unitPriceHT) || 0;
    return {
      id: it.id || `item_${Date.now()}_${index}`,
      productId: it.productId || `prod_custom_${index}`,
      description: it.description || 'Article commercial',
      quantity: q,
      unitPriceHT: p,
      totalHT: q * p
    };
  });

  const totalHT = computedItems.reduce((sum, it) => sum + it.totalHT, 0);
  const tvaRate = applyTva && db.company.enableTva ? db.company.tvaRate : 0;
  const tvaAmount = Math.round(totalHT * tvaRate);
  const totalTTC = totalHT + tvaAmount;

  const hasValidNIU = clientNIU && clientNIU.trim().length >= 8;
  const effectiveAcompteRate = applyAcompte && db.company.enableAcompte 
    ? (hasValidNIU ? db.company.acompteRate : 0.055) 
    : 0;
  const acompteAmount = Math.round(totalHT * effectiveAcompteRate);
  const netAPayer = totalTTC - acompteAmount;

  const seq = db.invoices.length + 900;
  const invoiceNumber = `FACT-2026-${seq.toString().padStart(4, '0')}`;

  const newInvoice: Invoice = {
    id: `inv_${Date.now()}`,
    invoiceNumber,
    date: new Date().toISOString().split('T')[0],
    dueDate: dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    clientId: clientId || `cli_${Date.now()}`,
    clientName,
    clientNIU: clientNIU || '',
    clientPhone: clientPhone || '',
    clientCity: clientCity || 'Douala',
    status: status as any,
    items: computedItems,
    totalHT,
    tvaRate,
    tvaAmount,
    acompteRate: effectiveAcompteRate,
    acompteAmount,
    totalTTC,
    netAPayer,
    paymentMethod,
    notes
  };

  // 1. Decrement stock for invoiced items
  computedItems.forEach(it => {
    const p = db.products.find(prod => prod.id === it.productId);
    if (p) {
      p.stockCurrent = Math.max(0, p.stockCurrent - it.quantity);
      // Log stock movement
      db.stockMovements.unshift({
        id: `mvt_${Date.now()}_${it.productId}`,
        referenceDoc: invoiceNumber,
        date: newInvoice.date,
        type: 'SORTIE',
        productId: p.id,
        productName: p.name,
        quantity: it.quantity,
        unitCost: p.cmup,
        totalCost: it.quantity * p.cmup,
        newCmup: p.cmup,
        reason: `Vente facture ${invoiceNumber}`,
        performedBy: db.user.name
      });
    }
  });

  // 2. Update client statistics
  let client = db.clients.find(c => c.id === clientId);
  if (!client && clientName) {
    client = {
      id: newInvoice.clientId,
      name: clientName,
      company: clientName,
      niu: clientNIU || '',
      email: '',
      phone: clientPhone || '',
      city: clientCity || 'Douala',
      segment: 'REGULIER',
      totalSpent: 0,
      outstandingBalance: 0,
      invoicesCount: 0,
      lastOrderDate: newInvoice.date,
      iaRecommendation: 'Nouveau client à fidéliser avec offres packagées.'
    };
    db.clients.unshift(client);
  }

  if (client) {
    client.totalSpent += totalHT;
    client.invoicesCount += 1;
    client.lastOrderDate = newInvoice.date;
    if (status !== 'PAYEE') {
      client.outstandingBalance += netAPayer;
    }
  }

  // 3. If invoice is marked PAID right away, record in Treasury
  if (status === 'PAYEE') {
    db.recordPaymentInTreasury(
      paymentMethod,
      netAPayer,
      `Règlement Facture ${invoiceNumber} - ${clientName}`,
      invoiceNumber
    );
  }

  db.invoices.unshift(newInvoice);
  pgService.createInvoice(newInvoice).catch(() => {});

  res.status(201).json({
    invoice: newInvoice,
    message: `Facture ${invoiceNumber} générée avec succès selon le référentiel OHADA.`
  });
});

// PATCH /api/invoices/:id/status
router.patch('/:id/status', (req: Request, res: Response) => {
  const { status, paymentMethod } = req.body;
  const invoice = db.invoices.find(i => i.id === req.params.id);

  if (!invoice) {
    return res.status(404).json({ error: 'Facture introuvable' });
  }

  const prevStatus = invoice.status;
  invoice.status = status;
  pgService.updateInvoiceStatus(req.params.id, status, paymentMethod).catch(() => {});

  if (status === 'PAYEE' && prevStatus !== 'PAYEE') {
    // Reduce client outstanding balance
    const client = db.clients.find(c => c.id === invoice.clientId);
    if (client) {
      client.outstandingBalance = Math.max(0, client.outstandingBalance - invoice.netAPayer);
    }
    // Record in Treasury
    const channel = paymentMethod || invoice.paymentMethod || 'ESPECES';
    db.recordPaymentInTreasury(
      channel,
      invoice.netAPayer,
      `Encaissement Facture ${invoice.invoiceNumber} - ${invoice.clientName}`,
      invoice.invoiceNumber
    );
  }

  res.json({
    invoice,
    message: `Statut de la facture ${invoice.invoiceNumber} mis à jour : ${status}`
  });
});

export default router;
