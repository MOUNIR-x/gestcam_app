import { Router, Request, Response } from 'express';
import authMiddleware from '../middleware/auth.js';
import { InvoiceItem } from '../../src/types/index';
import { pgService } from '../services/pgService.js';
import { db } from '../../src/db/index.js';
import * as schema from '../../src/db/schema.js';
import { eq, and, count } from 'drizzle-orm';

const router = Router();

// Protect invoices routes: require authenticated user with tenant context
router.use(authMiddleware);

// GET /api/invoices
router.get('/', async (req: Request, res: Response) => {
  const { status, clientId, search } = req.query;
  const companyId = Number((req as any).auth?.companyId);
  if (!companyId) return res.status(403).json({ error: 'Contexte entreprise manquant' });

  try {
    const pgInvs = await pgService.getInvoices(companyId);
    let list: any[] = [...pgInvs];

    if (status && status !== 'TOUTES') {
      list = list.filter(i => i.status === status);
    }

    if (clientId) {
      list = list.filter(i => String(i.clientId) === String(clientId));
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(i => 
        (i.invoiceNumber && i.invoiceNumber.toLowerCase().includes(q)) ||
        (i.clientName && i.clientName.toLowerCase().includes(q)) ||
        (i.clientNIU && i.clientNIU.toLowerCase().includes(q))
      );
    }

    res.json({
      invoices: list,
      totalCount: list.length,
      summary: {
        totalHT: list.reduce((s, i) => s + (Number(i.totalHT) || 0), 0),
        totalTTC: list.reduce((s, i) => s + (Number(i.totalTTC) || 0), 0),
        totalNetAPayer: list.reduce((s, i) => s + (Number(i.netAPayer) || 0), 0),
        paidCount: list.filter(i => i.status === 'PAYEE').length,
        pendingCount: list.filter(i => i.status === 'EN_ATTENTE').length,
        overdueCount: list.filter(i => i.status === 'EN_RETARD').length
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erreur lors du chargement des factures' });
  }
});

// GET /api/invoices/:id
router.get('/:id', async (req: Request, res: Response) => {
  const companyId = Number((req as any).auth?.companyId);
  if (!companyId) return res.status(403).json({ error: 'Contexte entreprise manquant' });

  try {
    const invoice = await pgService.getInvoiceById(req.params.id, companyId);
    if (!invoice) {
      return res.status(404).json({ error: 'Facture introuvable' });
    }
    res.json(invoice);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erreur lors du chargement de la facture' });
  }
});

// POST /api/invoices/calculate (Tax engine preview)
router.post('/calculate', async (req: Request, res: Response) => {
  const { items, applyTva = true, applyAcompte = true, clientNIU } = req.body;
  const companyId = Number((req as any).auth?.companyId);

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Liste d\'articles requise' });
  }

  const company = companyId ? await pgService.getCompanyById(companyId) : null;
  const enableTva = company?.enableTva ?? true;
  const enableAcompte = company?.enableAcompte ?? true;
  const compTvaRate = company?.tvaRate ?? 0.1925;
  const compAcompteRate = company?.acompteRate ?? 0.022;

  const totalHT = items.reduce((sum: number, it: any) => {
    const q = Number(it.quantity) || 0;
    const p = Number(it.unitPriceHT) || 0;
    return sum + (q * p);
  }, 0);

  // OHADA Cameroon TVA rate: 19.25% (17.5% + 10% CAC)
  const tvaRate = applyTva && enableTva ? compTvaRate : 0;
  const tvaAmount = Math.round(totalHT * tvaRate);
  const totalTTC = totalHT + tvaAmount;

  // Acompte AIRS: 2.2% if client has valid NIU, 5.5% if unmatriculated
  const hasValidNIU = clientNIU && String(clientNIU).trim().length >= 8;
  const effectiveAcompteRate = applyAcompte && enableAcompte 
    ? (hasValidNIU ? compAcompteRate : 0.055) 
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
router.post('/', async (req: Request, res: Response) => {
  const companyId = Number((req as any).auth?.companyId);
  if (!companyId) return res.status(403).json({ error: 'Contexte entreprise manquant' });

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

  try {
    const company = await pgService.getCompanyById(companyId);
    const enableTva = company?.enableTva ?? true;
    const enableAcompte = company?.enableAcompte ?? true;
    const compTvaRate = company?.tvaRate ?? 0.1925;
    const compAcompteRate = company?.acompteRate ?? 0.022;

    // Compute amounts
    const computedItems: InvoiceItem[] = items.map((it: any, index: number) => {
      const q = Number(it.quantity) || 1;
      const p = Number(it.unitPriceHT) || 0;
      return {
        id: it.id || `item_${Date.now()}_${index}`,
        productId: it.productId || '',
        description: it.description || 'Article commercial',
        quantity: q,
        unitPriceHT: p,
        totalHT: q * p
      };
    });

    const totalHT = computedItems.reduce((sum, it) => sum + it.totalHT, 0);
    const tvaRate = applyTva && enableTva ? compTvaRate : 0;
    const tvaAmount = Math.round(totalHT * tvaRate);
    const totalTTC = totalHT + tvaAmount;
    const hasValidNIU = clientNIU && String(clientNIU).trim().length >= 8;
    const effectiveAcompteRate = applyAcompte && enableAcompte
      ? (hasValidNIU ? compAcompteRate : 0.055)
      : 0;
    const acompteAmount = Math.round(totalHT * effectiveAcompteRate);
    const netAPayer = totalTTC - acompteAmount;
    const today = new Date().toISOString().split('T')[0];
    const dueDateFinal = dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

    // ================================================================
    // TRANSACTION ACID : Toutes les opérations ou aucune (OHADA §99)
    // Garantit : numérotation continue, cohérence stock & trésorerie
    // ================================================================
    const inserted = await db.transaction(async (tx) => {
      // 1. Numérotation atomique : compte les factures de CE tenant dans la transaction
      const [countRow] = await tx
        .select({ total: count() })
        .from(schema.invoices)
        .where(eq(schema.invoices.companyId, companyId));
      const seq = (Number(countRow?.total) || 0) + 1;
      const year = new Date().getFullYear();
      const invoiceNumber = `FACT-${year}-${seq.toString().padStart(4, '0')}`;

      // 2. Insérer la facture
      const [newInvoice] = await tx.insert(schema.invoices).values({
        companyId,
        invoiceNumber,
        date: today,
        dueDate: dueDateFinal,
        clientId: clientId ? Number(clientId) : null,
        clientName,
        clientNIU: clientNIU || '',
        clientPhone: clientPhone || '',
        clientCity: clientCity || company?.city || 'Douala',
        status: status || 'EN_ATTENTE',
        items: JSON.stringify(computedItems),
        totalHT: Math.round(totalHT),
        tvaRate,
        tvaAmount,
        acompteRate: effectiveAcompteRate,
        acompteAmount,
        totalTTC,
        netAPayer,
        paymentMethod,
        notes: notes || null
      }).returning();

      // 3. Décrémenter les stocks et enregistrer les sorties pour chaque article
      const currentProducts = await tx
        .select()
        .from(schema.products)
        .where(eq(schema.products.companyId, companyId));

      for (const it of computedItems) {
        const p = currentProducts.find(
          prod => String(prod.id) === String(it.productId) || prod.reference === it.productId
        );
        if (p) {
          const newStock = Math.max(0, p.stockCurrent - it.quantity);

          // Mise à jour atomique du stock dans la même transaction
          await tx.update(schema.products)
            .set({ stockCurrent: newStock })
            .where(and(eq(schema.products.id, p.id), eq(schema.products.companyId, companyId)));

          // Enregistrement du bon de sortie de stock
          await tx.insert(schema.stockMovements).values({
            companyId,
            referenceDoc: invoiceNumber,
            date: today,
            type: 'SORTIE',
            productId: p.id,
            productName: p.name,
            quantity: it.quantity,
            unitCost: p.cmup,
            totalCost: Math.round(it.quantity * p.cmup),
            newCmup: p.cmup,
            reason: `Vente facture ${invoiceNumber}`,
            performedBy: (req as any).auth?.email || 'GestCam'
          });
        }
      }

      // 4. Si payée immédiatement, enregistrer l'encaissement en trésorerie
      if (status === 'PAYEE') {
        const accounts = await tx
          .select()
          .from(schema.treasuryAccounts)
          .where(eq(schema.treasuryAccounts.companyId, companyId));
        const acc = accounts.find(a => a.type === paymentMethod) || accounts[0];
        if (acc) {
          await tx.insert(schema.treasuryTransactions).values({
            companyId,
            date: today,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            accountId: acc.id,
            accountName: acc.name,
            channel: paymentMethod,
            type: 'ENTREE',
            category: 'Vente Client',
            amount: Math.round(netAPayer),
            description: `Règlement Facture ${invoiceNumber} - ${clientName}`,
            referenceNumber: invoiceNumber,
            status: 'COMPLETE'
          });

          // Mise à jour du solde du compte dans la même transaction
          await tx.update(schema.treasuryAccounts)
            .set({
              balance: acc.balance + Math.round(netAPayer),
              todayInflow: acc.todayInflow + Math.round(netAPayer)
            })
            .where(eq(schema.treasuryAccounts.id, acc.id));
        }
      }

      return newInvoice;
    });
    // ================================================================

    res.status(201).json({
      invoice: inserted,
      message: `Facture ${inserted.invoiceNumber} générée avec succès selon le référentiel OHADA.`
    });
  } catch (err: any) {
    console.error('[POST /api/invoices] Transaction error:', err);
    res.status(500).json({ error: err?.message || 'Erreur lors de la création de la facture' });
  }
});


// PATCH /api/invoices/:id/status
router.patch('/:id/status', async (req: Request, res: Response) => {
  const companyId = Number((req as any).auth?.companyId);
  if (!companyId) return res.status(403).json({ error: 'Contexte entreprise manquant' });

  const { status, paymentMethod } = req.body;

  try {
    const invoice = await pgService.getInvoiceById(req.params.id, companyId);
    if (!invoice) {
      return res.status(404).json({ error: 'Facture introuvable' });
    }

    const prevStatus = invoice.status;
    const updated = await pgService.updateInvoiceStatus(invoice.id, status, paymentMethod, companyId);

    // If marked paid, record in Treasury
    if (status === 'PAYEE' && prevStatus !== 'PAYEE') {
      const accounts = await pgService.getTreasuryAccounts(companyId);
      const channel = paymentMethod || invoice.paymentMethod || 'ESPECES';
      const acc = accounts.find(a => a.type === channel) || accounts[0];
      if (acc) {
        await pgService.recordTreasuryTransaction({
          accountId: acc.id,
          accountName: acc.name,
          channel,
          type: 'ENTREE',
          category: 'Vente Client',
          amount: invoice.netAPayer,
          description: `Encaissement Facture ${invoice.invoiceNumber} - ${invoice.clientName}`,
          referenceNumber: invoice.invoiceNumber
        }, companyId);
      }
    }

    res.json({
      invoice: updated,
      message: `Statut de la facture ${invoice.invoiceNumber} mis à jour : ${status}`
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erreur lors de la mise à jour du statut' });
  }
});

export default router;
