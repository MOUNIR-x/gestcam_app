import { db } from '../../src/db/index.ts';
import * as schema from '../../src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { db as memoryStore } from '../data/store.js';

export const pgService = {
  async getCompany() {
    try {
      const rows = await db.select().from(schema.companies).limit(1);
      if (rows && rows.length > 0) {
        return rows[0];
      }
    } catch (e) {
      console.warn('[Postgres] Falling back to memory for company:', (e as any)?.message);
    }
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
        purchasePrice: Math.round(p.purchasePrice || 0),
        sellingPrice: Math.round(p.sellingPrice || 0),
        cmup: Math.round(p.cmup || p.purchasePrice || 0),
        stockCurrent: Math.round(p.stockCurrent || 0),
        stockMin: Math.round(p.stockMin || 10),
        marginPercent: p.marginPercent || 0
      }).returning();
      if (inserted) return inserted;
    } catch (e) {
      console.warn('[Postgres] Failed to insert product in SQL, writing to memory store:', (e as any)?.message);
    }
    const newProd = { ...p, id: `prod_${Date.now()}` };
    memoryStore.products.unshift(newProd);
    return newProd;
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
        totalHT: Math.round(inv.totalHT),
        tvaRate: inv.tvaRate || 0.1925,
        tvaAmount: Math.round(inv.tvaAmount || 0),
        acompteRate: inv.acompteRate || 0.022,
        acompteAmount: Math.round(inv.acompteAmount || 0),
        totalTTC: Math.round(inv.totalTTC),
        netAPayer: Math.round(inv.netAPayer),
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
    if (!isNaN(numericId)) {
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
        amount: Math.round(tx.amount),
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
  }
};
