import { db } from '../../src/db/index.ts';
import * as schema from '../../src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { db as memoryStore } from '../data/store.js';

const toNumber = (value: unknown, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

export const pgService = {
  async getUser() {
    try {
      const rows = await db.select().from(schema.users).limit(1);
      if (rows && rows.length > 0) return rows[0];
    } catch (e) {
      console.warn('[Postgres] Falling back to memory for user:', (e as any)?.message);
    }
    return memoryStore.user;
  },

  async upsertUser(data: any) {
    const payload = {
      uid: String(data?.uid || data?.id || `usr_${Date.now()}`),
      email: String(data?.email || memoryStore.user.email),
      name: data?.name || memoryStore.user.name,
      role: data?.role || memoryStore.user.role,
      companyName: data?.companyName || memoryStore.user.companyName,
      city: data?.city || memoryStore.user.city,
    };

    try {
      const existing = await db.select().from(schema.users).where(eq(schema.users.email, payload.email)).limit(1);
      if (existing.length > 0) {
        const [updated] = await db.update(schema.users)
          .set({
            uid: payload.uid,
            name: payload.name,
            role: payload.role,
            companyName: payload.companyName,
            city: payload.city,
          })
          .where(eq(schema.users.id, existing[0].id))
          .returning();
        if (updated) return updated;
      }

      const [inserted] = await db.insert(schema.users).values(payload).returning();
      if (inserted) return inserted;
    } catch (e) {
      console.warn('[Postgres] Failed to upsert user:', (e as any)?.message);
    }

    memoryStore.user = { ...memoryStore.user, ...payload };
    return memoryStore.user;
  },

  async getCompany() {
    try {
      const rows = await db.select().from(schema.companies).limit(1);
      if (rows && rows.length > 0) return rows[0];
    } catch (e) {
      console.warn('[Postgres] Falling back to memory for company:', (e as any)?.message);
    }
    return memoryStore.company;
  },

  async upsertCompany(data: any) {
    const payload = {
      name: data?.name || memoryStore.company.name,
      commercialName: data?.commercialName || data?.name || memoryStore.company.commercialName,
      niu: data?.niu || memoryStore.company.niu,
      rccm: data?.rccm || memoryStore.company.rccm,
      cdi: data?.cdi || memoryStore.company.cdi,
      regime: data?.regime || memoryStore.company.regime,
      address: data?.address || memoryStore.company.address,
      city: data?.city || memoryStore.company.city,
      phone: data?.phone || memoryStore.company.phone,
      email: data?.email || memoryStore.company.email,
      website: data?.website || memoryStore.company.website || null,
      tvaRate: toNumber(data?.tvaRate ?? memoryStore.company.tvaRate, 0.1925),
      acompteRate: toNumber(data?.acompteRate ?? memoryStore.company.acompteRate, 0.022),
      enableTva: Boolean(data?.enableTva ?? memoryStore.company.enableTva),
      enableAcompte: Boolean(data?.enableAcompte ?? memoryStore.company.enableAcompte),
      stockLowAlertThreshold: toNumber(data?.stockLowAlertThreshold ?? memoryStore.company.stockLowAlertThreshold, 10),
    };

    try {
      const existing = await db.select().from(schema.companies).limit(1);
      if (existing.length > 0) {
        const [updated] = await db.update(schema.companies)
          .set(payload)
          .where(eq(schema.companies.id, existing[0].id))
          .returning();
        if (updated) return updated;
      }

      const [inserted] = await db.insert(schema.companies).values(payload).returning();
      if (inserted) return inserted;
    } catch (e) {
      console.warn('[Postgres] Failed to upsert company:', (e as any)?.message);
    }

    memoryStore.company = { ...memoryStore.company, ...payload };
    return memoryStore.company;
  },

  async getProducts() {
    try {
      const rows = await db.select().from(schema.products).orderBy(schema.products.id);
      return rows ?? [];
    } catch (e) {
      console.warn('[Postgres] Falling back to memory for products:', (e as any)?.message);
    }
    return memoryStore.products;
  },

  async addProduct(p: any) {
    try {
      const [inserted] = await db.insert(schema.products).values({
        reference: p.reference || `REF-${Date.now()}`,
        name: p.name,
        category: p.category || 'Général',
        unit: p.unit || 'Pièce',
        purchasePrice: Math.round(toNumber(p.purchasePrice, 0)),
        sellingPrice: Math.round(toNumber(p.sellingPrice, 0)),
        cmup: Math.round(toNumber(p.cmup, p.purchasePrice || 0)),
        stockCurrent: Math.round(toNumber(p.stockCurrent, 0)),
        stockMin: Math.round(toNumber(p.stockMin, 10)),
        marginPercent: toNumber(p.marginPercent, 0)
      }).returning();
      if (inserted) return inserted;
    } catch (e) {
      console.warn('[Postgres] Failed to insert product in SQL, writing to memory store:', (e as any)?.message);
    }
    const newProd = { ...p, id: `prod_${Date.now()}` };
    memoryStore.products.unshift(newProd);
    return newProd;
  },

  async updateProductStock(productId: string, stockCurrent: number, cmup: number, purchasePrice: number, marginPercent: number) {
    const numericId = Number(productId);
    if (!Number.isNaN(numericId)) {
      try {
        const [updated] = await db.update(schema.products)
          .set({
            stockCurrent: Math.round(toNumber(stockCurrent, 0)),
            cmup: Math.round(toNumber(cmup, 0)),
            purchasePrice: Math.round(toNumber(purchasePrice, 0)),
            marginPercent: toNumber(marginPercent, 0),
          })
          .where(eq(schema.products.id, numericId))
          .returning();
        if (updated) return updated;
      } catch (e) {
        console.warn('[Postgres] Failed to update product stock:', (e as any)?.message);
      }
    }

    const product = memoryStore.products.find((p) => p.id === productId);
    if (product) {
      product.stockCurrent = toNumber(stockCurrent, product.stockCurrent);
      product.cmup = toNumber(cmup, product.cmup);
      product.purchasePrice = toNumber(purchasePrice, product.purchasePrice);
      product.marginPercent = toNumber(marginPercent, product.marginPercent);
      return product;
    }
    return null;
  },

  async getStockMovements() {
    try {
      const rows = await db.select().from(schema.stockMovements).orderBy(desc(schema.stockMovements.id));
      return rows ?? [];
    } catch (e) {
      console.warn('[Postgres] Failed to load stock movements:', (e as any)?.message);
    }
    return memoryStore.stockMovements;
  },

  async addStockMovement(mvt: any) {
    try {
      const [inserted] = await db.insert(schema.stockMovements).values({
        referenceDoc: mvt.referenceDoc || `MVT-${Date.now()}`,
        date: mvt.date || new Date().toISOString().split('T')[0],
        type: mvt.type || 'ENTREE',
        productId: Number(mvt.productId) || null,
        productName: mvt.productName || '',
        quantity: Math.round(toNumber(mvt.quantity, 0)),
        unitCost: Math.round(toNumber(mvt.unitCost, 0)),
        totalCost: Math.round(toNumber(mvt.totalCost, 0)),
        newCmup: Math.round(toNumber(mvt.newCmup, 0)),
        reason: mvt.reason || '',
        performedBy: mvt.performedBy || 'GestCam'
      }).returning();
      if (inserted) return inserted;
    } catch (e) {
      console.warn('[Postgres] Failed to insert stock movement:', (e as any)?.message);
    }
    const movement = { ...mvt, id: `mvt_${Date.now()}` };
    memoryStore.stockMovements.unshift(movement);
    return movement;
  },

  async getInventoryRecords() {
    try {
      const rows = await db.select().from(schema.stockMovements).orderBy(desc(schema.stockMovements.id));
      return rows ?? [];
    } catch (e) {
      console.warn('[Postgres] Failed to load inventory records:', (e as any)?.message);
    }
    return memoryStore.inventoryRecords;
  },

  async recordInventoryReconciliation(data: any) {
    const productId = String(data.productId || '');
    const product = memoryStore.products.find((p) => p.id === productId) || (await this.getProducts()).find((p: any) => p.id === productId);
    if (!product) return null;

    const physicalStock = toNumber(data.physicalStock, product.stockCurrent);
    const variance = physicalStock - product.stockCurrent;
    const varianceValueFCFA = variance * product.cmup;
    const status: 'CONFORME' | 'ECART_MINEUR' | 'ECART_CRITIQUE' =
      Math.abs(varianceValueFCFA) > 100000
        ? 'ECART_CRITIQUE'
        : variance === 0
          ? 'CONFORME'
          : 'ECART_MINEUR';

    const record = {
      id: `inv_rec_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      productId,
      productName: product.name,
      theoreticalStock: product.stockCurrent,
      physicalStock,
      variance,
      varianceValueFCFA,
      status,
      notes: data.notes || 'Réconciliation du stock'
    };

    memoryStore.inventoryRecords.unshift(record);
    return record;
  },

  async getInvoices() {
    try {
      const rows = await db.select().from(schema.invoices).orderBy(desc(schema.invoices.id));
      return rows ?? [];
    } catch (e) {
      console.warn('[Postgres] Falling back to memory for invoices:', (e as any)?.message);
    }
    return memoryStore.invoices;
  },

  async getInvoiceById(id: string) {
    try {
      const rows = await db.select().from(schema.invoices).where(eq(schema.invoices.invoiceNumber, id)).limit(1);
      if (rows.length > 0) return rows[0];
      const rowsById = await db.select().from(schema.invoices).where(eq(schema.invoices.id, Number(id))).limit(1);
      if (rowsById.length > 0) return rowsById[0];
    } catch (e) {
      console.warn('[Postgres] Failed to load invoice by id:', (e as any)?.message);
    }
    return memoryStore.invoices.find((i) => i.id === id || i.invoiceNumber === id) || null;
  },

  async createInvoice(inv: any) {
    try {
      const [inserted] = await db.insert(schema.invoices).values({
        invoiceNumber: inv.invoiceNumber,
        date: inv.date,
        dueDate: inv.dueDate,
        clientName: inv.clientName,
        clientNIU: inv.clientNIU || null,
        clientPhone: inv.clientPhone || null,
        clientCity: inv.clientCity || 'Douala',
        status: inv.status || 'EN_ATTENTE',
        totalHT: Math.round(toNumber(inv.totalHT, 0)),
        tvaRate: toNumber(inv.tvaRate, 0.1925),
        tvaAmount: Math.round(toNumber(inv.tvaAmount, 0)),
        acompteRate: toNumber(inv.acompteRate, 0.022),
        acompteAmount: Math.round(toNumber(inv.acompteAmount, 0)),
        totalTTC: Math.round(toNumber(inv.totalTTC, 0)),
        netAPayer: Math.round(toNumber(inv.netAPayer, 0)),
        paymentMethod: inv.paymentMethod || null,
        notes: inv.notes || null
      }).returning();
      if (inserted) return inserted;
    } catch (e) {
      console.warn('[Postgres] Failed to insert invoice in SQL, using memory:', (e as any)?.message);
    }
    const newInvoice = { ...inv, id: `inv_${Date.now()}` };
    memoryStore.invoices.unshift(newInvoice);
    return newInvoice;
  },

  async updateInvoiceStatus(id: string | number, status: string, paymentMethod?: string) {
    const numericId = Number(id);
    if (!Number.isNaN(numericId)) {
      try {
        await db.update(schema.invoices)
          .set({ status, paymentMethod: paymentMethod || undefined })
          .where(eq(schema.invoices.id, numericId));
      } catch (e) {
        console.warn('[Postgres] Failed to update invoice in SQL:', (e as any)?.message);
      }
    }
    const found = memoryStore.invoices.find(i => i.id === String(id) || i.id === `inv_${id}`);
    if (found) {
      found.status = status as any;
      if (paymentMethod) (found as any).paymentMethod = paymentMethod;
    }
    return found;
  },

  async getClients() {
    try {
      const rows = await db.select().from(schema.clients);
      return rows ?? [];
    } catch (e) {
      console.warn('[Postgres] Falling back to memory for clients:', (e as any)?.message);
    }
    return memoryStore.clients;
  },

  async createClient(client: any) {
    try {
      const [inserted] = await db.insert(schema.clients).values({
        name: client.name,
        company: client.company || client.name,
        niu: client.niu || null,
        phone: client.phone || '',
        email: client.email || null,
        city: client.city || 'Douala',
        totalSpent: Math.round(toNumber(client.totalSpent, 0)),
        outstandingBalance: Math.round(toNumber(client.outstandingBalance, 0)),
        invoicesCount: Math.round(toNumber(client.invoicesCount, 0)),
      }).returning();
      if (inserted) return inserted;
    } catch (e) {
      console.warn('[Postgres] Failed to insert client in SQL:', (e as any)?.message);
    }
    const newClient = { ...client, id: `cli_${Date.now()}` };
    memoryStore.clients.unshift(newClient);
    return newClient;
  },

  async getSuppliers() {
    try {
      const rows = await db.select().from(schema.suppliers);
      return rows ?? [];
    } catch (e) {
      console.warn('[Postgres] Falling back to memory for suppliers:', (e as any)?.message);
    }
    return [];
  },

  async getTreasuryAccounts() {
    try {
      const rows = await db.select().from(schema.treasuryAccounts);
      return rows ?? [];
    } catch (e) {
      console.warn('[Postgres] Falling back to memory for treasury accounts:', (e as any)?.message);
    }
    return memoryStore.treasuryAccounts;
  },

  async getTreasuryTransactions() {
    try {
      const rows = await db.select().from(schema.treasuryTransactions).orderBy(desc(schema.treasuryTransactions.id));
      return rows ?? [];
    } catch (e) {
      console.warn('[Postgres] Falling back to memory for treasury txs:', (e as any)?.message);
    }
    return memoryStore.treasuryTransactions;
  },

  async recordTreasuryTransaction(tx: any) {
    try {
      const [inserted] = await db.insert(schema.treasuryTransactions).values({
        date: tx.date,
        time: tx.time,
        accountName: tx.accountName,
        channel: tx.channel,
        type: tx.type,
        category: tx.category,
        amount: Math.round(toNumber(tx.amount, 0)),
        description: tx.description,
        referenceNumber: tx.referenceNumber,
        status: tx.status || 'COMPLETE'
      }).returning();
      if (inserted) return inserted;
    } catch (e) {
      console.warn('[Postgres] Failed to insert treasury tx in SQL:', (e as any)?.message);
    }
    const newTx = { ...tx, id: `tx_${Date.now()}` };
    memoryStore.treasuryTransactions.unshift(newTx);
    return newTx;
  },

  async getFraudAlerts() {
    try {
      const rows = await db.select().from(schema.fraudAlerts).orderBy(desc(schema.fraudAlerts.id));
      return rows ?? [];
    } catch (e) {
      console.warn('[Postgres] Falling back to memory for fraud alerts:', (e as any)?.message);
    }
    return memoryStore.fraudAlerts;
  },

  async createFraudAlert(alert: any) {
    try {
      const [inserted] = await db.insert(schema.fraudAlerts).values({
        type: alert.type || 'GENERIC',
        severity: alert.severity || 'MOYEN',
        title: alert.title || 'Alerte de sécurité',
        description: alert.description || '',
        amount: Math.round(toNumber(alert.amount, 0)),
        entityId: alert.entityId || null,
        entityType: alert.entityType || null,
        timestamp: alert.timestamp || new Date().toISOString(),
        resolved: false
      }).returning();
      if (inserted) return inserted;
    } catch (e) {
      console.warn('[Postgres] Failed to insert fraud alert:', (e as any)?.message);
    }
    const alertItem = { ...alert, id: `alert_${Date.now()}` };
    memoryStore.fraudAlerts.unshift(alertItem);
    return alertItem;
  },

  async resolveFraudAlert(id: string) {
    try {
      const rowId = Number(id);
      if (!Number.isNaN(rowId)) {
        const [updated] = await db.update(schema.fraudAlerts)
          .set({ resolved: true })
          .where(eq(schema.fraudAlerts.id, rowId))
          .returning();
        if (updated) return updated;
      }
    } catch (e) {
      console.warn('[Postgres] Failed to resolve alert:', (e as any)?.message);
    }

    const idx = memoryStore.fraudAlerts.findIndex((a) => a.id === id);
    if (idx >= 0) {
      const [removed] = memoryStore.fraudAlerts.splice(idx, 1);
      return removed;
    }
    return null;
  },

  async getEmployees() {
    return [];
  },

  async getMobileMoneyPayments() {
    return memoryStore.mobileMoneyPayments;
  },

  async createMobileMoneyPayment(payment: any) {
    const record = { ...payment, createdAt: new Date().toISOString() };
    memoryStore.mobileMoneyPayments.unshift(record);
    return record;
  },

  async updateMobileMoneyPayment(transactionId: string, status: string) {
    const payment = memoryStore.mobileMoneyPayments.find((p) => p.transactionId === transactionId);
    if (payment) {
      payment.status = status as any;
      payment.confirmedAt = new Date().toISOString();
    }
    return payment;
  }
};
