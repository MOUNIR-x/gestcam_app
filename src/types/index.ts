export type Currency = 'FCFA';

export function formatFCFA(amount: number): string {
  // Format with non-breaking spaces e.g., 1 240 000 FCFA
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
}

export type BusinessType = 
  | 'COMMERCE_GENERAL' 
  | 'BTP_PRESTATIONS' 
  | 'RESTAURATION_HOTEL' 
  | 'PHARMACIE_SANTE' 
  | 'AGRO_ALIMENTAIRE';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  companyName: string;
  city: string;
  avatarColor: string;
}

export interface CompanySettings {
  name: string;
  commercialName: string;
  niu: string; // Numéro d'Identifiant Unique (Cameroun)
  rccm: string; // Registre du Commerce
  cdi: string; // Centre des Impôts
  regime: 'REEL' | 'SIMPLIFIE';
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  tvaRate: number; // 0.1925 (19.25%)
  acompteRate: number; // 0.022 (2.2% AIRS)
  enableTva: boolean;
  enableAcompte: boolean;
  stockLowAlertThreshold: number;
}

export interface Product {
  id: string;
  reference: string;
  name: string;
  category: string;
  unit: string; // Carton, Sac 50kg, Paquet, Litre, Rouleau, Pièce
  purchasePrice: number; // Dernier prix d'achat
  sellingPrice: number; // Prix de vente
  cmup: number; // Coût Moyen Unitaire Pondéré (Calculé automatiquement, affiché en bleu)
  stockCurrent: number;
  stockMin: number;
  marginPercent: number; // ((sellingPrice - cmup) / sellingPrice) * 100
  supplierId?: string;
}

export interface StockMovement {
  id: string;
  referenceDoc: string;
  date: string;
  type: 'ENTREE' | 'SORTIE' | 'AJUSTEMENT';
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  newCmup: number;
  reason: string;
  performedBy: string;
}

export interface InventoryRecord {
  id: string;
  date: string;
  productId: string;
  productName: string;
  theoreticalStock: number;
  physicalStock: number;
  variance: number; // physicalStock - theoreticalStock
  varianceValueFCFA: number; // variance * cmup
  status: 'CONFORME' | 'ECART_MINEUR' | 'ECART_CRITIQUE';
  notes: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  description: string;
  quantity: number;
  unitPriceHT: number;
  totalHT: number;
}

export type InvoiceStatus = 'PAYEE' | 'EN_ATTENTE' | 'EN_RETARD' | 'BROUILLON';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. FACT-2026-0814
  date: string;
  dueDate: string;
  clientId: string;
  clientName: string;
  clientNIU?: string;
  clientPhone: string;
  clientCity: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  totalHT: number;
  tvaRate: number; // 0.1925
  tvaAmount: number;
  acompteRate: number; // 0.022
  acompteAmount: number;
  totalTTC: number; // totalHT + tvaAmount
  netAPayer: number; // totalTTC - acompteAmount (AIRS retenu si applicable)
  paymentMethod?: 'MTN_MOMO' | 'ORANGE_MONEY' | 'ESPECES' | 'VIREMENT_BANCAIRE';
  notes?: string;
}

export type ClientSegment = 'VIP' | 'REGULIER' | 'PERDU';

export interface Client {
  id: string;
  name: string;
  company: string;
  niu?: string;
  email: string;
  phone: string;
  city: string; // Douala, Yaoundé, Bafoussam, Garoua, etc.
  segment: ClientSegment;
  totalSpent: number;
  outstandingBalance: number; // Impayé en cours
  invoicesCount: number;
  lastOrderDate: string;
  iaRecommendation: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  contactName: string;
  phone: string;
  email: string;
  city: string;
  paymentTerms: string; // ex: "Paiement 30 jours", "Comptant MoMo"
  totalPurchased: number;
  balanceOwed: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  deliveryDate: string;
  itemsCount: number;
  totalAmount: number;
  status: 'LIVRE' | 'EN_COURS' | 'VALIDE' | 'BROUILLON';
}

export type PaymentChannelType = 'MTN_MOMO' | 'ORANGE_MONEY' | 'ESPECES' | 'BANQUE';

export interface TreasuryAccount {
  id: string;
  name: string;
  type: PaymentChannelType;
  accountNumber: string;
  balance: number;
  todayInflow: number;
  todayOutflow: number;
}

export interface TreasuryTransaction {
  id: string;
  date: string;
  time: string;
  accountId: string;
  accountName: string;
  channel: PaymentChannelType;
  type: 'ENTREE' | 'SORTIE';
  category: string;
  amount: number;
  description: string;
  referenceNumber: string;
  status: 'COMPLETE' | 'SUSPECT' | 'EN_COURS';
}

export interface FraudAuditAlert {
  id: string;
  severity: 'HAUTE' | 'MOYENNE' | 'FAIBLE';
  title: string;
  description: string;
  amountImpactFCFA?: number;
  date: string;
  suggestedFix: string;
}

export type AttendanceStatus = 'PRESENT' | 'RETARD' | 'ABSENT' | 'CONGE';

export interface Employee {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  phone: string;
  hireDate: string;
  baseSalary: number;
  attendance: AttendanceStatus;
  cnpsNumber: string;
  // Décomptes de paie OHADA
  primeTransport: number;
  primeRendement: number;
  deductionCNPS: number; // 4.2% employé
  deductionIRPP: number; // Barème progressif IRPP
  deductionCAC: number; // 10% de l'IRPP (Centimes Additionnels Communaux)
  netAPayer: number;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'gestcam_ai';
  text: string;
  timestamp: string;
  chips?: string[];
  suggestedAction?: {
    label: string;
    path: string;
  };
}
