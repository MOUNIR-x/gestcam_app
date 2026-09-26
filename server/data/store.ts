// In-memory data store for GestCam Cameroon PME Backend
import {
  Product,
  StockMovement,
  InventoryRecord,
  Invoice,
  Client,
  Supplier,
  PurchaseOrder,
  TreasuryAccount,
  TreasuryTransaction,
  FraudAuditAlert,
  Employee,
  CompanySettings,
  UserProfile
} from '../../src/types/index';
import {
  mockCompanySettings,
  mockCurrentUser,
  mockProducts,
  mockStockMovements,
  mockInventoryRecords,
  mockInvoices,
  mockClients,
  mockSuppliers,
  mockPurchaseOrders,
  mockTreasuryAccounts,
  mockTreasuryTransactions,
  mockFraudAlerts,
  mockEmployees
} from '../../src/data/mockData';

export interface MobileMoneyPayment {
  transactionId: string;
  reference: string;
  operator: 'MTN_MOMO' | 'ORANGE_MONEY';
  phoneNumber: string;
  amount: number;
  invoiceId: string;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  createdAt: string;
  confirmedAt?: string;
}

const initialCleanTreasuryAccounts: TreasuryAccount[] = [
  {
    id: 'acc_1',
    name: 'MTN Mobile Money',
    type: 'MTN_MOMO',
    accountNumber: '+237 6 77 00 00 00',
    balance: 0,
    todayInflow: 0,
    todayOutflow: 0
  },
  {
    id: 'acc_2',
    name: 'Orange Money',
    type: 'ORANGE_MONEY',
    accountNumber: '+237 6 99 00 00 00',
    balance: 0,
    todayInflow: 0,
    todayOutflow: 0
  },
  {
    id: 'acc_3',
    name: 'Afriland First Bank (Compte Courant)',
    type: 'BANQUE',
    accountNumber: '10005-00012-34567890123-45',
    balance: 0,
    todayInflow: 0,
    todayOutflow: 0
  },
  {
    id: 'acc_4',
    name: 'Caisse Principale Espèces',
    type: 'ESPECES',
    accountNumber: 'CAISSE-DLA-01',
    balance: 0,
    todayInflow: 0,
    todayOutflow: 0
  }
];

class BackendStore {
  public company: CompanySettings = { ...mockCompanySettings };
  public user: UserProfile = { ...mockCurrentUser };
  public products: Product[] = [];
  public stockMovements: StockMovement[] = [];
  public inventoryRecords: InventoryRecord[] = [];
  public invoices: Invoice[] = [];
  public clients: Client[] = [];
  public suppliers: Supplier[] = [];
  public purchaseOrders: PurchaseOrder[] = [];
  public treasuryAccounts: TreasuryAccount[] = [...initialCleanTreasuryAccounts];
  public treasuryTransactions: TreasuryTransaction[] = [];
  public fraudAlerts: FraudAuditAlert[] = [];
  public employees: Employee[] = [];
  public mobileMoneyPayments: MobileMoneyPayment[] = [];

  // Helper to recalculate inventory CMUP (Coût Moyen Unitaire Pondéré)
  public calculateCMUP(currentStock: number, currentCmup: number, incomingQty: number, incomingCost: number): number {
    const totalQty = currentStock + incomingQty;
    if (totalQty <= 0) return incomingCost;
    const totalValuation = (currentStock * currentCmup) + (incomingQty * incomingCost);
    return Math.round(totalValuation / totalQty);
  }

  // Record a payment into treasury
  public recordPaymentInTreasury(channel: 'MTN_MOMO' | 'ORANGE_MONEY' | 'ESPECES' | 'BANQUE', amount: number, desc: string, ref: string) {
    const account = this.treasuryAccounts.find(a => a.type === channel) || this.treasuryAccounts[0];
    const newTx: TreasuryTransaction = {
      id: `tx_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      accountId: account.id,
      accountName: account.name,
      channel,
      type: 'ENTREE',
      category: 'Vente Client',
      amount,
      description: desc,
      referenceNumber: ref,
      status: 'COMPLETE'
    };

    account.balance += amount;
    account.todayInflow += amount;
    this.treasuryTransactions.unshift(newTx);
    return newTx;
  }
}

export const db = new BackendStore();
