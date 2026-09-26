import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  integer,
  doublePrecision,
  boolean,
  timestamp
} from 'drizzle-orm/pg-core';

// Users table (Firebase Auth UID as unique identifier)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('Gérant PME'),
  companyName: text('company_name').default('BatiCam Distribution Sarl'),
  city: text('city').default('Douala'),
  createdAt: timestamp('created_at').defaultNow()
});

// Company Settings (Fiscal & legal registration Cameroon)
export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  commercialName: text('commercial_name').notNull(),
  niu: text('niu').notNull(), // Numéro d'Identifiant Unique (Cameroun)
  rccm: text('rccm').notNull(), // Registre du Commerce
  cdi: text('cdi').notNull(), // Centre des Impôts
  regime: text('regime').notNull().default('REEL'), // REEL | SIMPLIFIE
  address: text('address').notNull(),
  city: text('city').notNull().default('Douala'),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  website: text('website'),
  tvaRate: doublePrecision('tva_rate').notNull().default(0.1925), // 19.25%
  acompteRate: doublePrecision('acompte_rate').notNull().default(0.022), // 2.2% AIRS
  enableTva: boolean('enable_tva').notNull().default(true),
  enableAcompte: boolean('enable_acompte').notNull().default(true),
  stockLowAlertThreshold: integer('stock_low_alert_threshold').notNull().default(15),
  createdAt: timestamp('created_at').defaultNow()
});

// Clients Table
export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  company: text('company').notNull(),
  niu: text('niu'),
  rccm: text('rccm'),
  phone: text('phone').notNull(),
  email: text('email'),
  city: text('city').notNull().default('Douala'),
  totalSpent: integer('total_spent').notNull().default(0),
  outstandingBalance: integer('outstanding_balance').notNull().default(0),
  invoicesCount: integer('invoices_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow()
});

// Suppliers Table
export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  contactName: text('contact_name'),
  phone: text('phone'),
  city: text('city').default('Douala'),
  totalPurchased: integer('total_purchased').notNull().default(0),
  balanceOwed: integer('balance_owed').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow()
});

// Products & Inventory Catalog
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  reference: text('reference').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  unit: text('unit').notNull().default('Pièce'),
  purchasePrice: integer('purchase_price').notNull(),
  sellingPrice: integer('selling_price').notNull(),
  cmup: integer('cmup').notNull(), // Coût Moyen Unitaire Pondéré (OHADA)
  stockCurrent: integer('stock_current').notNull().default(0),
  stockMin: integer('stock_min').notNull().default(10),
  marginPercent: doublePrecision('margin_percent').notNull().default(0),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  createdAt: timestamp('created_at').defaultNow()
});

// Stock Movements Log
export const stockMovements = pgTable('stock_movements', {
  id: serial('id').primaryKey(),
  referenceDoc: text('reference_doc').notNull(),
  date: text('date').notNull(),
  type: text('type').notNull(), // ENTREE | SORTIE | AJUSTEMENT
  productId: integer('product_id').references(() => products.id),
  productName: text('product_name').notNull(),
  quantity: integer('quantity').notNull(),
  unitCost: integer('unit_cost').notNull(),
  totalCost: integer('total_cost').notNull(),
  newCmup: integer('new_cmup').notNull(),
  reason: text('reason'),
  performedBy: text('performed_by'),
  createdAt: timestamp('created_at').defaultNow()
});

// Invoices Table (OHADA strict compliance)
export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  date: text('date').notNull(),
  dueDate: text('due_date').notNull(),
  clientId: integer('client_id').references(() => clients.id),
  clientName: text('client_name').notNull(),
  clientNIU: text('client_niu'),
  clientPhone: text('client_phone'),
  clientCity: text('client_city'),
  status: text('status').notNull().default('EN_ATTENTE'), // PAYEE | EN_ATTENTE | EN_RETARD
  totalHT: integer('total_ht').notNull(),
  tvaRate: doublePrecision('tva_rate').notNull().default(0.1925),
  tvaAmount: integer('tva_amount').notNull(),
  acompteRate: doublePrecision('acompte_rate').notNull().default(0.022),
  acompteAmount: integer('acompte_amount').notNull(),
  totalTTC: integer('total_ttc').notNull(),
  netAPayer: integer('net_a_payer').notNull(),
  paymentMethod: text('payment_method'), // MTN_MOMO | ORANGE_MONEY | BANQUE | ESPECES
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow()
});

// Invoice Items
export const invoiceItems = pgTable('invoice_items', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id').references(() => invoices.id).notNull(),
  productId: integer('product_id').references(() => products.id),
  description: text('description').notNull(),
  quantity: integer('quantity').notNull(),
  unitPriceHT: integer('unit_price_ht').notNull(),
  totalHT: integer('total_ht').notNull()
});

// Treasury Accounts
export const treasuryAccounts = pgTable('treasury_accounts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // MTN_MOMO | ORANGE_MONEY | BANQUE | ESPECES
  accountNumber: text('account_number'),
  balance: integer('balance').notNull().default(0),
  todayInflow: integer('today_inflow').notNull().default(0),
  todayOutflow: integer('today_outflow').notNull().default(0),
  currency: text('currency').notNull().default('FCFA')
});

// Treasury Transactions
export const treasuryTransactions = pgTable('treasury_transactions', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  accountId: integer('account_id').references(() => treasuryAccounts.id),
  accountName: text('account_name').notNull(),
  channel: text('channel').notNull(),
  type: text('type').notNull(), // ENTREE | SORTIE
  category: text('category').notNull(),
  amount: integer('amount').notNull(),
  description: text('description'),
  referenceNumber: text('reference_number'),
  status: text('status').notNull().default('COMPLETE'),
  createdAt: timestamp('created_at').defaultNow()
});

// Fraud and Audit Alerts
export const fraudAlerts = pgTable('fraud_alerts', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(),
  severity: text('severity').notNull(), // CRITIQUE | ELEVE | MOYEN | FAIBLE
  title: text('title').notNull(),
  description: text('description').notNull(),
  amount: integer('amount'),
  entityId: text('entity_id'),
  entityType: text('entity_type'),
  timestamp: text('timestamp').notNull(),
  resolved: boolean('resolved').notNull().default(false)
});

// Table Relations
export const usersRelations = relations(users, ({ one }) => ({
  company: one(companies, {
    fields: [users.id],
    references: [companies.userId]
  })
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id]
  }),
  items: many(invoiceItems)
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id]
  }),
  product: one(products, {
    fields: [invoiceItems.productId],
    references: [products.id]
  })
}));

export const productsRelations = relations(products, ({ many }) => ({
  movements: many(stockMovements),
  invoiceItems: many(invoiceItems)
}));
