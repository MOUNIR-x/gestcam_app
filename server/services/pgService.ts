import { db } from '../../src/db/index.ts';
import * as schema from '../../src/db/schema.ts';
import { eq, desc, and, or } from 'drizzle-orm';
import crypto from 'crypto';

const toNumber = (value: unknown, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const hashPassword = async (password: string) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = await new Promise<Buffer>((resolve, reject) =>
    crypto.scrypt(password, salt, 64, (error, key) => error ? reject(error) : resolve(key))
  );
  return `scrypt$${salt}$${derived.toString('hex')}`;
};

const verifyPassword = async (storedHash: string | null | undefined, password: string) => {
  if (!storedHash) return false;
  const [algorithm, salt, expected] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !expected) return false;
  const derived = await new Promise<Buffer>((resolve, reject) =>
    crypto.scrypt(password, salt, 64, (error, key) => error ? reject(error) : resolve(key))
  );
  const expectedBuffer = Buffer.from(expected, 'hex');
  return expectedBuffer.length === derived.length && crypto.timingSafeEqual(expectedBuffer, derived);
};

export const pgService = {
  hashPassword,
  verifyPassword,

  // ==========================================
  // USERS & TENANT COMPANIES
  // ==========================================
  async getUser(uid?: string) {
    try {
      if (!uid) {
        console.warn('[Postgres] getUser called without uid — returning null');
        return null;
      }
      const rows = await db.select().from(schema.users).where(eq(schema.users.uid, String(uid))).limit(1);
      return rows.length > 0 ? rows[0] : null;
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
      passwordHash: data?.passwordHash || null,
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
        passwordHash: data?.passwordHash || null,
      };
      const [inserted] = await db.insert(schema.users).values(payload).returning();
      if (inserted) return inserted;
      return null;
    } catch (e) {
      console.error('[Postgres] createUser error:', (e as any)?.message);
      throw e;
    }
  },

  async getCompany(companyId?: number, userId?: number) {
    try {
      if (companyId) {
        const rows = await db.select().from(schema.companies).where(eq(schema.companies.id, Number(companyId))).limit(1);
        return rows.length > 0 ? rows[0] : null;
      }
      if (userId) {
        const rows = await db.select().from(schema.companies).where(eq(schema.companies.userId, Number(userId))).limit(1);
        return rows.length > 0 ? rows[0] : null;
      }
      return null;
    } catch (e) {
      console.error('[Postgres] getCompany error:', (e as any)?.message);
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
      return inserted || null;
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

  // ==========================================
  // PRODUCTS & STOCKS (MULTI-TENANT)
  // ==========================================
  async getProducts(companyId?: number) {
    try {
      if (!companyId) return [];
      const rows = await db.select().from(schema.products).where(eq(schema.products.companyId, companyId)).orderBy(schema.products.id);
      return rows ?? [];
    } catch (e) {
      console.error('[Postgres] getProducts error:', (e as any)?.message);
      throw e;
    }
  },

  async addProduct(p: any, companyId: number) {
    try {
      const [inserted] = await db.insert(schema.products).values({
        companyId,
        reference: p.reference || `REF-${Date.now()}`,
        name: p.name,
        category: p.category || 'Général',
        unit: p.unit || 'Pièce',
        purchasePrice: Math.round(toNumber(p.purchasePrice, 0)),
        sellingPrice: Math.round(toNumber(p.sellingPrice, 0)),
        cmup: Math.round(toNumber(p.cmup, p.purchasePrice || 0)),
        stockCurrent: Math.round(toNumber(p.stockCurrent, 0)),
        stockMin: Math.round(toNumber(p.stockMin, 10)),
        marginPercent: toNumber(p.marginPercent, 0),
        supplierId: p.supplierId ? Number(p.supplierId) : null
      }).returning();
      if (inserted) return inserted;
    } catch (e) {
      console.error('[Postgres] Failed to insert product in SQL:', (e as any)?.message);
      throw e;
    }
  },

  async updateProductStock(productId: string | number, stockCurrent: number, cmup: number, purchasePrice: number, marginPercent: number, companyId?: number) {
    const numericId = Number(productId);
    if (Number.isNaN(numericId)) throw new Error('Product ID not numeric; update aborted');

    try {
      const condition = companyId
        ? and(eq(schema.products.id, numericId), eq(schema.products.companyId, companyId))
        : eq(schema.products.id, numericId);

      const [updated] = await db.update(schema.products)
        .set({
          stockCurrent: Math.round(toNumber(stockCurrent, 0)),
          cmup: Math.round(toNumber(cmup, 0)),
          purchasePrice: Math.round(toNumber(purchasePrice, 0)),
          marginPercent: toNumber(marginPercent, 0),
        })
        .where(condition)
        .returning();
      return updated || null;
    } catch (e) {
      console.error('[Postgres] Failed to update product stock:', (e as any)?.message);
      throw e;
    }
  },

  async getStockMovements(companyId?: number) {
    try {
      if (!companyId) return [];
      const rows = await db.select().from(schema.stockMovements)
        .where(eq(schema.stockMovements.companyId, companyId))
        .orderBy(desc(schema.stockMovements.id));
      return rows ?? [];
    } catch (e) {
      console.error('[Postgres] Failed to load stock movements:', (e as any)?.message);
      throw e;
    }
  },

  async addStockMovement(mvt: any, companyId: number) {
    try {
      const [inserted] = await db.insert(schema.stockMovements).values({
        companyId,
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
      return inserted || null;
    } catch (e) {
      console.error('[Postgres] Failed to insert stock movement:', (e as any)?.message);
      throw e;
    }
  },

  async getInventoryRecords(companyId?: number) {
    try {
      if (!companyId) return [];
      const rows = await db.select().from(schema.inventoryRecords)
        .where(eq(schema.inventoryRecords.companyId, companyId))
        .orderBy(desc(schema.inventoryRecords.id));
      return rows ?? [];
    } catch (e) {
      console.error('[Postgres] Failed to load inventory records:', (e as any)?.message);
      throw e;
    }
  },

  async recordInventoryReconciliation(data: any, companyId: number) {
    const productId = Number(data.productId);
    const [product] = await db.select().from(schema.products)
      .where(and(eq(schema.products.id, productId), eq(schema.products.companyId, companyId)))
      .limit(1);

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

    try {
      const [insertedRecord] = await db.insert(schema.inventoryRecords).values({
        companyId,
        date: data.date || new Date().toISOString().split('T')[0],
        productId: product.id,
        productName: product.name,
        theoreticalStock: product.stockCurrent,
        physicalStock,
        variance,
        varianceValueFCFA: Math.round(varianceValueFCFA),
        status,
        notes: data.notes || (variance === 0 ? 'Conforme au stock théorique' : `Écart constaté de ${variance} unités`)
      }).returning();

      // Also log the adjustment movement in stockMovements
      await db.insert(schema.stockMovements).values({
        companyId,
        referenceDoc: `INV-${insertedRecord.id}`,
        date: insertedRecord.date,
        type: 'AJUSTEMENT',
        productId: product.id,
        productName: product.name,
        quantity: variance,
        unitCost: product.cmup || 0,
        totalCost: Math.round(variance * (product.cmup || 0)),
        newCmup: product.cmup || 0,
        reason: insertedRecord.notes,
        performedBy: 'system_inventory_reconciliation'
      });

      // Update current stock to reflect physical count
      await db.update(schema.products)
        .set({ stockCurrent: physicalStock })
        .where(eq(schema.products.id, product.id));

      return insertedRecord;
    } catch (e) {
      console.error('[Postgres] Failed to record inventory reconciliation:', (e as any)?.message);
      throw e;
    }
  },

  // ==========================================
  // INVOICES (MULTI-TENANT)
  // ==========================================
  async getInvoices(companyId?: number) {
    try {
      if (!companyId) return [];
      const rows = await db.select().from(schema.invoices)
        .where(eq(schema.invoices.companyId, companyId))
        .orderBy(desc(schema.invoices.id));
      return rows ?? [];
    } catch (e) {
      console.error('[Postgres] getInvoices error:', (e as any)?.message);
      throw e;
    }
  },

  async getInvoiceById(id: string | number, companyId?: number) {
    try {
      const numericId = Number(id);
      if (!Number.isNaN(numericId)) {
        const condition = companyId
          ? and(eq(schema.invoices.id, numericId), eq(schema.invoices.companyId, companyId))
          : eq(schema.invoices.id, numericId);
        const rowsById = await db.select().from(schema.invoices).where(condition).limit(1);
        if (rowsById.length > 0) return rowsById[0];
      }

      const strCondition = companyId
        ? and(eq(schema.invoices.invoiceNumber, String(id)), eq(schema.invoices.companyId, companyId))
        : eq(schema.invoices.invoiceNumber, String(id));
      const rows = await db.select().from(schema.invoices).where(strCondition).limit(1);
      if (rows.length > 0) return rows[0];
    } catch (e) {
      console.error('[Postgres] Failed to load invoice by id:', (e as any)?.message);
      throw e;
    }
    return null;
  },

  async createInvoice(inv: any, companyId: number) {
    try {
      const [inserted] = await db.insert(schema.invoices).values({
        companyId,
        invoiceNumber: inv.invoiceNumber,
        date: inv.date,
        dueDate: inv.dueDate,
        clientId: inv.clientId ? Number(inv.clientId) : null,
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

      if (inserted && inv.items && Array.isArray(inv.items)) {
        for (const item of inv.items) {
          await db.insert(schema.invoiceItems).values({
            companyId,
            invoiceId: inserted.id,
            productId: item.productId ? Number(item.productId) : null,
            description: item.description || 'Article',
            quantity: Math.round(toNumber(item.quantity, 1)),
            unitPriceHT: Math.round(toNumber(item.unitPriceHT, 0)),
            totalHT: Math.round(toNumber(item.totalHT, 0))
          });
        }
      }

      return inserted;
    } catch (e) {
      console.error('[Postgres] Failed to insert invoice in SQL:', (e as any)?.message);
      throw e;
    }
  },

  async updateInvoiceStatus(id: string | number, status: string, paymentMethod?: string, companyId?: number) {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) throw new Error('Invoice ID not numeric; update aborted');

    try {
      const condition = companyId
        ? and(eq(schema.invoices.id, numericId), eq(schema.invoices.companyId, companyId))
        : eq(schema.invoices.id, numericId);

      const [updated] = await db.update(schema.invoices)
        .set({ status, paymentMethod: paymentMethod || undefined })
        .where(condition)
        .returning();
      return updated || null;
    } catch (e) {
      console.error('[Postgres] Failed to update invoice in SQL:', (e as any)?.message);
      throw e;
    }
  },

  // ==========================================
  // CLIENTS (MULTI-TENANT)
  // ==========================================
  async getClients(companyId?: number) {
    try {
      if (!companyId) return [];
      const rows = await db.select().from(schema.clients)
        .where(eq(schema.clients.companyId, companyId))
        .orderBy(schema.clients.name);
      return rows ?? [];
    } catch (e) {
      console.error('[Postgres] getClients error:', (e as any)?.message);
      throw e;
    }
  },

  async createClient(client: any, companyId: number) {
    try {
      const [inserted] = await db.insert(schema.clients).values({
        companyId,
        name: client.name,
        company: client.company || client.name,
        niu: client.niu || null,
        rccm: client.rccm || null,
        phone: client.phone || '',
        email: client.email || null,
        city: client.city || 'Douala',
        totalSpent: Math.round(toNumber(client.totalSpent, 0)),
        outstandingBalance: Math.round(toNumber(client.outstandingBalance, 0)),
        invoicesCount: Math.round(toNumber(client.invoicesCount, 0)),
      }).returning();
      return inserted || null;
    } catch (e) {
      console.error('[Postgres] Failed to insert client in SQL:', (e as any)?.message);
      throw e;
    }
  },

  // ==========================================
  // SUPPLIERS (MULTI-TENANT)
  // ==========================================
  async getSuppliers(companyId?: number) {
    try {
      if (!companyId) return [];
      const rows = await db.select().from(schema.suppliers)
        .where(eq(schema.suppliers.companyId, companyId))
        .orderBy(schema.suppliers.name);
      return rows ?? [];
    } catch (e) {
      console.error('[Postgres] getSuppliers error:', (e as any)?.message);
      throw e;
    }
  },

  async createSupplier(supplier: any, companyId: number) {
    try {
      const [inserted] = await db.insert(schema.suppliers).values({
        companyId,
        name: supplier.name,
        category: supplier.category || 'Général',
        contactName: supplier.contactName || null,
        phone: supplier.phone || null,
        email: supplier.email || null,
        city: supplier.city || 'Douala',
        paymentTerms: supplier.paymentTerms || 'Comptant',
        totalPurchased: Math.round(toNumber(supplier.totalPurchased, 0)),
        balanceOwed: Math.round(toNumber(supplier.balanceOwed, 0))
      }).returning();
      return inserted || null;
    } catch (e) {
      console.error('[Postgres] Failed to insert supplier in SQL:', (e as any)?.message);
      throw e;
    }
  },

  // ==========================================
  // TREASURY (MULTI-TENANT)
  // ==========================================
  async getTreasuryAccounts(companyId?: number) {
    try {
      if (!companyId) return [];
      let rows = await db.select().from(schema.treasuryAccounts)
        .where(eq(schema.treasuryAccounts.companyId, companyId));

      // Auto-initialize standard default accounts if empty for this company
      if (rows.length === 0) {
        const defaults = [
          { name: 'MTN Mobile Money', type: 'MTN_MOMO', accountNumber: '+237 6 77 00 00 00' },
          { name: 'Orange Money', type: 'ORANGE_MONEY', accountNumber: '+237 6 99 00 00 00' },
          { name: 'Afriland First Bank', type: 'BANQUE', accountNumber: '10005-00012-34567890123-45' },
          { name: 'Caisse Principale Espèces', type: 'ESPECES', accountNumber: 'CAISSE-DLA-01' }
        ];

        for (const def of defaults) {
          await db.insert(schema.treasuryAccounts).values({
            companyId,
            name: def.name,
            type: def.type,
            accountNumber: def.accountNumber,
            balance: 0,
            todayInflow: 0,
            todayOutflow: 0,
            currency: 'FCFA'
          });
        }

        rows = await db.select().from(schema.treasuryAccounts)
          .where(eq(schema.treasuryAccounts.companyId, companyId));
      }

      return rows ?? [];
    } catch (e) {
      console.error('[Postgres] getTreasuryAccounts error:', (e as any)?.message);
      throw e;
    }
  },

  async getTreasuryTransactions(companyId?: number) {
    try {
      if (!companyId) return [];
      const rows = await db.select().from(schema.treasuryTransactions)
        .where(eq(schema.treasuryTransactions.companyId, companyId))
        .orderBy(desc(schema.treasuryTransactions.id));
      return rows ?? [];
    } catch (e) {
      console.error('[Postgres] getTreasuryTransactions error:', (e as any)?.message);
      throw e;
    }
  },

  async recordTreasuryTransaction(tx: any, companyId?: number) {
    try {
      const targetCompanyId = companyId || Number(tx.companyId);
      const [inserted] = await db.insert(schema.treasuryTransactions).values({
        companyId: targetCompanyId || null,
        date: tx.date || new Date().toISOString().split('T')[0],
        time: tx.time || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        accountId: tx.accountId ? Number(tx.accountId) : null,
        accountName: tx.accountName || 'Compte Trésorerie',
        channel: tx.channel || 'ESPECES',
        type: tx.type || 'ENTREE',
        category: tx.category || 'Vente Client',
        amount: Math.round(toNumber(tx.amount, 0)),
        description: tx.description || '',
        referenceNumber: tx.referenceNumber || `REF-${Date.now()}`,
        status: tx.status || 'COMPLETE'
      }).returning();

      // Update the account balance
      if (tx.accountId && targetCompanyId) {
        const delta = tx.type === 'ENTREE' ? Math.round(toNumber(tx.amount, 0)) : -Math.round(toNumber(tx.amount, 0));
        const [acc] = await db.select().from(schema.treasuryAccounts)
          .where(and(eq(schema.treasuryAccounts.id, Number(tx.accountId)), eq(schema.treasuryAccounts.companyId, targetCompanyId)));
        if (acc) {
          await db.update(schema.treasuryAccounts)
            .set({
              balance: acc.balance + delta,
              todayInflow: tx.type === 'ENTREE' ? acc.todayInflow + Math.round(toNumber(tx.amount, 0)) : acc.todayInflow,
              todayOutflow: tx.type === 'SORTIE' ? acc.todayOutflow + Math.round(toNumber(tx.amount, 0)) : acc.todayOutflow
            })
            .where(eq(schema.treasuryAccounts.id, acc.id));
        }
      }

      return inserted || null;
    } catch (e) {
      console.error('[Postgres] Failed to insert treasury tx in SQL:', (e as any)?.message);
      throw e;
    }
  },

  // ==========================================
  // FRAUD ALERTS (MULTI-TENANT)
  // ==========================================
  async getFraudAlerts(companyId?: number) {
    try {
      if (!companyId) return [];
      const rows = await db.select().from(schema.fraudAlerts)
        .where(eq(schema.fraudAlerts.companyId, companyId))
        .orderBy(desc(schema.fraudAlerts.id));
      return rows ?? [];
    } catch (e) {
      console.error('[Postgres] getFraudAlerts error:', (e as any)?.message);
      throw e;
    }
  },

  async createFraudAlert(alert: any, companyId: number) {
    try {
      const [inserted] = await db.insert(schema.fraudAlerts).values({
        companyId,
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
      return inserted || null;
    } catch (e) {
      console.error('[Postgres] Failed to insert fraud alert:', (e as any)?.message);
      throw e;
    }
  },

  async resolveFraudAlert(id: string | number, companyId?: number) {
    try {
      const rowId = Number(id);
      if (!Number.isNaN(rowId)) {
        const condition = companyId
          ? and(eq(schema.fraudAlerts.id, rowId), eq(schema.fraudAlerts.companyId, companyId))
          : eq(schema.fraudAlerts.id, rowId);

        const [updated] = await db.update(schema.fraudAlerts)
          .set({ resolved: true })
          .where(condition)
          .returning();
        return updated || null;
      }
    } catch (e) {
      console.error('[Postgres] Failed to resolve alert:', (e as any)?.message);
      throw e;
    }
    return null;
  },

  // ==========================================
  // EMPLOYEES & RH (MULTI-TENANT)
  // ==========================================
  async getEmployees(companyId?: number) {
    try {
      if (!companyId) return [];
      const rows = await db.select().from(schema.employees)
        .where(eq(schema.employees.companyId, companyId))
        .orderBy(schema.employees.lastName);
      return rows ?? [];
    } catch (e) {
      console.error('[Postgres] getEmployees error:', (e as any)?.message);
      throw e;
    }
  },

  async createEmployee(data: any, companyId: number) {
    try {
      const [inserted] = await db.insert(schema.employees).values({
        companyId,
        matricule: data.matricule || `EMP-${Date.now().toString().slice(-4)}`,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        role: data.role || 'Employé',
        department: data.department || 'Opérations',
        phone: data.phone || '',
        hireDate: data.hireDate || new Date().toISOString().split('T')[0],
        baseSalary: Math.round(toNumber(data.baseSalary, 0)),
        attendance: data.attendance || 'PRESENT',
        cnpsNumber: data.cnpsNumber || null,
        primeTransport: Math.round(toNumber(data.primeTransport, 0)),
        primeRendement: Math.round(toNumber(data.primeRendement, 0)),
        deductionCNPS: Math.round(toNumber(data.deductionCNPS, 0)),
        deductionIRPP: Math.round(toNumber(data.deductionIRPP, 0)),
        deductionCAC: Math.round(toNumber(data.deductionCAC, 0)),
        netAPayer: Math.round(toNumber(data.netAPayer, 0))
      }).returning();
      return inserted || null;
    } catch (e) {
      console.error('[Postgres] createEmployee error:', (e as any)?.message);
      throw e;
    }
  },

  async updateEmployeeAttendance(id: string | number, attendance: string, companyId?: number) {
    try {
      const numericId = Number(id);
      if (Number.isNaN(numericId)) return null;

      const condition = companyId
        ? and(eq(schema.employees.id, numericId), eq(schema.employees.companyId, companyId))
        : eq(schema.employees.id, numericId);

      const [updated] = await db.update(schema.employees)
        .set({ attendance })
        .where(condition)
        .returning();
      return updated || null;
    } catch (e) {
      console.error('[Postgres] updateEmployeeAttendance error:', (e as any)?.message);
      throw e;
    }
  },

  // ==========================================
  // PURCHASE ORDERS (MULTI-TENANT)
  // ==========================================
  async getPurchaseOrders(companyId?: number) {
    try {
      if (!companyId) return [];
      const rows = await db.select().from(schema.purchaseOrders)
        .where(eq(schema.purchaseOrders.companyId, companyId))
        .orderBy(desc(schema.purchaseOrders.id));
      return rows ?? [];
    } catch (e) {
      console.error('[Postgres] getPurchaseOrders error:', (e as any)?.message);
      throw e;
    }
  },

  async createPurchaseOrder(data: any, companyId: number) {
    try {
      const [inserted] = await db.insert(schema.purchaseOrders).values({
        companyId,
        orderNumber: data.orderNumber || `BC-${Date.now().toString().slice(-5)}`,
        supplierId: data.supplierId ? Number(data.supplierId) : null,
        supplierName: data.supplierName || 'Fournisseur',
        date: data.date || new Date().toISOString().split('T')[0],
        deliveryDate: data.deliveryDate || new Date().toISOString().split('T')[0],
        itemsCount: Math.round(toNumber(data.itemsCount, 1)),
        totalAmount: Math.round(toNumber(data.totalAmount, 0)),
        status: data.status || 'BROUILLON'
      }).returning();
      return inserted || null;
    } catch (e) {
      console.error('[Postgres] createPurchaseOrder error:', (e as any)?.message);
      throw e;
    }
  },

  // ==========================================
  // MOBILE MONEY (MULTI-TENANT)
  // ==========================================
  async getMobileMoneyPayments(companyId?: number) {
    try {
      if (!companyId) return [];
      const rows = await db.select().from(schema.mobileMoneyPayments)
        .where(eq(schema.mobileMoneyPayments.companyId, companyId))
        .orderBy(desc(schema.mobileMoneyPayments.id));
      return rows ?? [];
    } catch (e) {
      console.error('[Postgres] getMobileMoneyPayments error:', (e as any)?.message);
      throw e;
    }
  },

  async createMobileMoneyPayment(payment: any, companyId?: number) {
    try {
      const [inserted] = await db.insert(schema.mobileMoneyPayments).values({
        companyId: companyId || null,
        transactionId: payment.transactionId || `TX-${Date.now()}`,
        reference: payment.reference || `REF-${Date.now()}`,
        operator: payment.operator || 'MTN_MOMO',
        phoneNumber: payment.phoneNumber || '',
        amount: Math.round(toNumber(payment.amount, 0)),
        invoiceId: payment.invoiceId || null,
        status: payment.status || 'PENDING'
      }).returning();
      return inserted || null;
    } catch (e) {
      console.error('[Postgres] createMobileMoneyPayment error:', (e as any)?.message);
      throw e;
    }
  },

  async findMobileMoneyPayment(query: string) {
    try {
      const rows = await db.select().from(schema.mobileMoneyPayments)
        .where(or(eq(schema.mobileMoneyPayments.transactionId, query), eq(schema.mobileMoneyPayments.reference, query)))
        .limit(1);
      return rows[0] || null;
    } catch (e) {
      console.error('[Postgres] findMobileMoneyPayment error:', (e as any)?.message);
      return null;
    }
  },

  async updateMobileMoneyPayment(transactionId: string, status: string) {
    try {
      const [updated] = await db.update(schema.mobileMoneyPayments)
        .set({ status, confirmedAt: new Date().toISOString() })
        .where(eq(schema.mobileMoneyPayments.transactionId, transactionId))
        .returning();
      return updated || null;
    } catch (e) {
      console.error('[Postgres] updateMobileMoneyPayment error:', (e as any)?.message);
      throw e;
    }
  }
};
