import { db } from '../../src/db/index.ts';
import * as schema from '../../src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';
// NOTE: removed in-memory fallback to force PostgreSQL persistence.

const toNumber = (value: unknown, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

// Local in-memory fallback lists used only when SQL operations are not available for specific features.
const localFallback: any = {
  fraudAlerts: [],
  mobileMoneyPayments: []
};

export const pgService = {
  async getUser() {
    try {
      const rows = await db.select().from(schema.users).limit(1);
      if (rows && rows.length > 0) return rows[0];
    } catch (e) {
      console.error('[Postgres] getUser error:', (e as any)?.message);
      throw e;
    }
  },

  async upsertUser(data: any) {
    const payload = {
      uid: String(data?.uid || data?.id || `usr_${Date.now()}`),
      email: String(data?.email || ''),
      name: data?.name || null,
      role: data?.role || 'Gérant PME',
      companyName: data?.companyName || null,
      city: data?.city || null,
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
      console.error('[Postgres] Failed to upsert user:', (e as any)?.message);
      throw e;
    }
  },

  async findUserByEmail(email: string) {
    try {
      const rows = await db.select().from(schema.users).where(eq(schema.users.email, String(email))).limit(1);
      return rows.length > 0 ? rows[0] : null;
    } catch (e) {
      console.error('[Postgres] findUserByEmail error:', (e as any)?.message);
      throw e;
    }
  },

  async getUserById(id: number) {
    try {
      const rows = await db.select().from(schema.users).where(eq(schema.users.id, Number(id))).limit(1);
      return rows.length > 0 ? rows[0] : null;
    } catch (e) {
      console.error('[Postgres] getUserById error:', (e as any)?.message);
      throw e;
    }
  },

  async createUser(data: any) {
    try {
      const payload = {
        uid: String(data?.uid || `usr_${Date.now()}`),
        email: String(data?.email || ''),
        name: data?.name || null,
        role: data?.role || 'Gérant PME',
        companyName: data?.companyName || null,
        city: data?.city || null,
      };
      const [inserted] = await db.insert(schema.users).values(payload).returning();
      if (inserted) return inserted;
      return null;
    } catch (e) {
      console.error('[Postgres] createUser error:', (e as any)?.message);
      throw e;
    }
  },

  async getCompany() {
    try {
      const rows = await db.select().from(schema.companies).limit(1);
      if (rows && rows.length > 0) return rows[0];
    } catch (e) {
      console.error('[Postgres] getCompany error:', (e as any)?.message);
      throw e;
    }
  },

  async upsertCompany(data: any) {
    const payload = {
      name: data?.name || 'Nouvelle Entreprise',
      commercialName: data?.commercialName || data?.name || 'Nouvelle Entreprise',
      niu: data?.niu || null,
      rccm: data?.rccm || null,
      cdi: data?.cdi || null,
      regime: data?.regime || 'REEL',
      address: data?.address || null,
      city: data?.city || 'Douala',
      phone: data?.phone || null,
      email: data?.email || null,
      website: data?.website || null,
      tvaRate: toNumber(data?.tvaRate ?? 0.1925, 0.1925),
      acompteRate: toNumber(data?.acompteRate ?? 0.022, 0.022),
      enableTva: Boolean(data?.enableTva ?? true),
      enableAcompte: Boolean(data?.enableAcompte ?? true),
      stockLowAlertThreshold: toNumber(data?.stockLowAlertThreshold ?? 15, 15),
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
      console.error('[Postgres] Failed to upsert company:', (e as any)?.message);
      throw e;
    }
  },

  async createCompanyForUser(data: any, userId: number) {
    try {
      const payload = {
        userId: Number(userId),
        name: data?.name || 'Nouvelle Entreprise',
        commercialName: data?.commercialName || data?.name || 'Nouvelle Entreprise',
        niu: data?.niu || null,
        rccm: data?.rccm || null,
        cdi: data?.cdi || null,
        regime: data?.regime || 'REEL',
        address: data?.address || null,
        city: data?.city || 'Douala',
        phone: data?.phone || null,
        email: data?.email || null,
        website: data?.website || null,
        tvaRate: toNumber(data?.tvaRate, 0.1925),
        acompteRate: toNumber(data?.acompteRate, 0.022),
        enableTva: Boolean(data?.enableTva ?? true),
        enableAcompte: Boolean(data?.enableAcompte ?? true),
        stockLowAlertThreshold: toNumber(data?.stockLowAlertThreshold, 15),
      };
      const [inserted] = await db.insert(schema.companies).values(payload).returning();
      if (inserted) return inserted;
      return null;
    } catch (e) {
      console.error('[Postgres] createCompanyForUser error:', (e as any)?.message);
      throw e;
    }
  },

  async updateCompanyForUser(userId: number, updates: any) {
    try {
      const existing = await db.select().from(schema.companies).where(eq(schema.companies.userId, Number(userId))).limit(1);
      if (existing.length === 0) return null;
      const [updated] = await db.update(schema.companies).set(updates).where(eq(schema.companies.id, existing[0].id)).returning();
      return updated || null;
    } catch (e) {
      console.error('[Postgres] updateCompanyForUser error:', (e as any)?.message);
      throw e;
    }
  },

  async getCompanyForUser(userId: number) {
    try {
      const rows = await db.select().from(schema.companies).where(eq(schema.companies.userId, Number(userId))).limit(1);
      return rows.length > 0 ? rows[0] : null;
    } catch (e) {
      console.error('[Postgres] getCompanyForUser error:', (e as any)?.message);
      throw e;
    }
  },

  async getCompanyById(id: number) {
    try {
      const rows = await db.select().from(schema.companies).where(eq(schema.companies.id, Number(id))).limit(1);
      return rows.length > 0 ? rows[0] : null;
    } catch (e) {
      console.error('[Postgres] getCompanyById error:', (e as any)?.message);
      throw e;
    }
  },

  async getProducts() {
    try {
      const rows = await db.select().from(schema.products).orderBy(schema.products.id);
      return rows ?? [];
    } catch (e) {
      console.error('[Postgres] getProducts error:', (e as any)?.message);
      throw e;
    }
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
      console.error('[Postgres] Failed to insert product in SQL:', (e as any)?.message);
      throw e;
    }
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

      // If product ID is not numeric we cannot update SQL
      throw new Error('Product ID not numeric; update aborted');
  },

  async getStockMovements() {
    try {
      const rows = await db.select().from(schema.stockMovements).orderBy(desc(schema.stockMovements.id));
      return rows ?? [];
    } catch (e) {
      console.warn('[Postgres] Failed to load stock movements:', (e as any)?.message);
      throw e;
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
      console.error('[Postgres] Failed to insert stock movement:', (e as any)?.message);
      throw e;
    }
  },

  async getInventoryRecords() {
    try {
      const rows = await db.select().from(schema.stockMovements).orderBy(desc(schema.stockMovements.id));
      return rows ?? [];
    } catch (e) {
        console.error('[Postgres] Failed to load inventory records:', (e as any)?.message);
      throw e;
    }
  },

  async recordInventoryReconciliation(data: any) {
    const productId = String(data.productId || '');
    const products = await this.getProducts();
    const product = products.find((p: any) => String(p.id) === String(productId));
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

    try {
      const [inserted] = await db.insert(schema.stockMovements).values({
        reference_doc: record.id,
        date: record.date,
        type: 'AJUSTEMENT',
        product_id: Number(productId) || null,
        product_name: record.productName,
        quantity: record.variance,
        unit_cost: product.cmup || 0,
        total_cost: Math.round(record.variance * (product.cmup || 0)),
        new_cmup: product.cmup || 0,
        reason: record.notes,
        performed_by: 'system_inventory_reconciliation'
      }).returning();
      return record;
    } catch (e) {
      console.error('[Postgres] Failed to record inventory reconciliation:', (e as any)?.message);
      throw e;
    }
  },

  async getInvoices() {
    try {
      const rows = await db.select().from(schema.invoices).orderBy(desc(schema.invoices.id));
      return rows ?? [];
    } catch (e) {
      console.error('[Postgres] getInvoices error:', (e as any)?.message);
      throw e;
    }
  },

  async getInvoiceById(id: string) {
    try {
      const rows = await db.select().from(schema.invoices).where(eq(schema.invoices.invoiceNumber, id)).limit(1);
      if (rows.length > 0) return rows[0];
      const rowsById = await db.select().from(schema.invoices).where(eq(schema.invoices.id, Number(id))).limit(1);
      if (rowsById.length > 0) return rowsById[0];
    } catch (e) {
      console.error('[Postgres] Failed to load invoice by id:', (e as any)?.message);
      throw e;
    }
    return null;
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
      console.error('[Postgres] Failed to insert invoice in SQL:', (e as any)?.message);
      throw e;
    }
  },

  async updateInvoiceStatus(id: string | number, status: string, paymentMethod?: string) {
    const numericId = Number(id);
    if (!Number.isNaN(numericId)) {
      try {
        await db.update(schema.invoices)
          .set({ status, paymentMethod: paymentMethod || undefined })
          .where(eq(schema.invoices.id, numericId));
      } catch (e) {
        console.error('[Postgres] Failed to update invoice in SQL:', (e as any)?.message);
        throw e;
      }
    }
    // If id is not numeric we cannot update SQL
    throw new Error('Invoice ID not numeric; update aborted');
  },

  async getClients() {
    try {
      const rows = await db.select().from(schema.clients);
      return rows ?? [];
    } catch (e) {
      console.error('[Postgres] getClients error:', (e as any)?.message);
      throw e;
    }
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
      console.error('[Postgres] Failed to insert client in SQL:', (e as any)?.message);
      throw e;
    }
  },

  async getSuppliers() {
    try {
      const rows = await db.select().from(schema.suppliers);
      return rows ?? [];
    } catch (e) {
      console.error('[Postgres] getSuppliers error:', (e as any)?.message);
      throw e;
    }
  },

  async getTreasuryAccounts() {
    try {
      const rows = await db.select().from(schema.treasuryAccounts);
      return rows ?? [];
    } catch (e) {
      console.error('[Postgres] getTreasuryAccounts error:', (e as any)?.message);
      throw e;
    }
  },

  async getTreasuryTransactions() {
    try {
      const rows = await db.select().from(schema.treasuryTransactions).orderBy(desc(schema.treasuryTransactions.id));
      return rows ?? [];
    } catch (e) {
      console.error('[Postgres] getTreasuryTransactions error:', (e as any)?.message);
      throw e;
    }
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
      console.error('[Postgres] Failed to insert treasury tx in SQL:', (e as any)?.message);
      throw e;
    }
  },

  async getFraudAlerts() {
    try {
      const rows = await db.select().from(schema.fraudAlerts).orderBy(desc(schema.fraudAlerts.id));
      return rows ?? [];
    } catch (e) {
      console.error('[Postgres] getFraudAlerts error:', (e as any)?.message);
      return localFallback.fraudAlerts;
    }
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
      console.error('[Postgres] Failed to insert fraud alert:', (e as any)?.message);
      const alertItem = { ...alert, id: `alert_${Date.now()}` };
      localFallback.fraudAlerts.unshift(alertItem);
      return alertItem;
    }
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
      console.error('[Postgres] Failed to resolve alert:', (e as any)?.message);
      // fallback to local in-memory
    }

    const idx = localFallback.fraudAlerts.findIndex((a: any) => a.id === id);
    if (idx >= 0) {
      const [removed] = localFallback.fraudAlerts.splice(idx, 1);
      return removed;
    }
    return null;
  },

  async getEmployees() {
    return [];
  },

  async getMobileMoneyPayments() {
    return localFallback.mobileMoneyPayments;
  },

  async createMobileMoneyPayment(payment: any) {
    const record = { ...payment, createdAt: new Date().toISOString() };
    localFallback.mobileMoneyPayments.unshift(record);
    return record;
  },

  async updateMobileMoneyPayment(transactionId: string, status: string) {
    const payment = localFallback.mobileMoneyPayments.find((p: any) => p.transactionId === transactionId);
    if (payment) {
      payment.status = status as any;
      payment.confirmedAt = new Date().toISOString();
    }
    return payment;
  }
};
