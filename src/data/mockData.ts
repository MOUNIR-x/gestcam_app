import {
  UserProfile,
  CompanySettings,
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
  AIMessage
} from '../types';

export const mockCurrentUser: UserProfile = {
  id: 'usr_01',
  name: 'Mounir Kamdem',
  email: 'mounir.kamdem@baticam-cm.com',
  phone: '+237 6 77 41 89 22',
  role: 'Directeur Général & Fondateur',
  companyName: 'BatiCam Distribution Sarl',
  city: 'Douala, Akwa',
  avatarColor: 'bg-blue-600 text-white'
};

export const mockCompanySettings: CompanySettings = {
  name: 'BatiCam Distribution Sarl',
  commercialName: 'BatiCam Matériaux & Quincaillerie',
  niu: 'M052012485901T',
  rccm: 'RC/DLA/2021/B/1429',
  cdi: 'CIME Douala 1 (Centre des Impôts des Moyennes Entreprises)',
  regime: 'REEL',
  address: '384 Boulevard de la Liberté, Face Ancien Cinéma Le Wouri',
  city: 'Douala',
  phone: '+237 2 33 42 18 90',
  email: 'contact@baticam-cm.com',
  website: 'www.baticam-cm.com',
  tvaRate: 0.1925,
  acompteRate: 0.022,
  enableTva: true,
  enableAcompte: true,
  stockLowAlertThreshold: 10
};

export const mockProducts: Product[] = [
  {
    id: 'prod_01',
    reference: 'CIM-DANG-50K',
    name: 'Ciment Dangote 42.5R - Sac 50kg',
    category: 'Gros Œuvre',
    unit: 'Sac 50kg',
    purchasePrice: 4750,
    sellingPrice: 5350,
    cmup: 4800,
    stockCurrent: 8, // Basse alerte! (Seuil = 10)
    stockMin: 25,
    marginPercent: 10.28,
    supplierId: 'sup_01'
  },
  {
    id: 'prod_02',
    reference: 'FER-BETON-12',
    name: 'Fer à Béton Haute Adhérence 12mm (Barre 12m)',
    category: 'Ferraillage',
    unit: 'Barre',
    purchasePrice: 5900,
    sellingPrice: 7200,
    cmup: 6050,
    stockCurrent: 350,
    stockMin: 100,
    marginPercent: 15.97,
    supplierId: 'sup_02'
  },
  {
    id: 'prod_03',
    reference: 'TOL-ALU-045',
    name: 'Tôle Bac Aluminium Ondulé 0.45mm (Longueur 3m)',
    category: 'Toiture',
    unit: 'Feuille',
    purchasePrice: 7800,
    sellingPrice: 9900,
    cmup: 7950,
    stockCurrent: 140,
    stockMin: 50,
    marginPercent: 19.70,
    supplierId: 'sup_03'
  },
  {
    id: 'prod_04',
    reference: 'PEIN-SEIG-BLA',
    name: 'Peinture Seigneurie Pantex 900 Blanc Mat - Fût 20L',
    category: 'Finition & Peinture',
    unit: 'Fût 20L',
    purchasePrice: 42000,
    sellingPrice: 54500,
    cmup: 42800,
    stockCurrent: 6, // Basse alerte!
    stockMin: 15,
    marginPercent: 21.47,
    supplierId: 'sup_04'
  },
  {
    id: 'prod_05',
    reference: 'CAB-NEX-25',
    name: 'Câble Électrique Rigide Cuivre Nexans 3x2.5mm² (100m)',
    category: 'Électricité',
    unit: 'Rouleau 100m',
    purchasePrice: 31000,
    sellingPrice: 39500,
    cmup: 31500,
    stockCurrent: 45,
    stockMin: 20,
    marginPercent: 20.25,
    supplierId: 'sup_05'
  },
  {
    id: 'prod_06',
    reference: 'CAR-POR-60',
    name: 'Carrelage Grès Cérame Émaillé 60x60 Gris Béton',
    category: 'Revêtement',
    unit: 'Carton 1.44m²',
    purchasePrice: 10500,
    sellingPrice: 14200,
    cmup: 10800,
    stockCurrent: 210,
    stockMin: 60,
    marginPercent: 23.94,
    supplierId: 'sup_06'
  },
  {
    id: 'prod_07',
    reference: 'TUY-PVC-110',
    name: 'Tube PVC Évacuation Assainissement Ø110mm (4m)',
    category: 'Plomberie',
    unit: 'Barre 4m',
    purchasePrice: 4200,
    sellingPrice: 5600,
    cmup: 4300,
    stockCurrent: 75,
    stockMin: 30,
    marginPercent: 23.21,
    supplierId: 'sup_04'
  },
  {
    id: 'prod_08',
    reference: 'DIS-MEUL-230',
    name: 'Disque à Tronçonner Métal Bosch Pro Ø230mm',
    category: 'Outillage',
    unit: 'Paquet 10 pcs',
    purchasePrice: 12500,
    sellingPrice: 16800,
    cmup: 12700,
    stockCurrent: 5, // Basse alerte!
    stockMin: 12,
    marginPercent: 24.40,
    supplierId: 'sup_05'
  }
];

export const mockStockMovements: StockMovement[] = [
  {
    id: 'mvt_01',
    referenceDoc: 'BL-DAN-2026-90',
    date: '2026-09-24',
    type: 'ENTREE',
    productId: 'prod_01',
    productName: 'Ciment Dangote 42.5R - Sac 50kg',
    quantity: 200,
    unitCost: 4750,
    totalCost: 950000,
    newCmup: 4800,
    reason: 'Réapprovisionnement usine Dangote Base Bonabéri',
    performedBy: 'Serge Atangana (Magasinier)'
  },
  {
    id: 'mvt_02',
    referenceDoc: 'FACT-2026-0428',
    date: '2026-09-24',
    type: 'SORTIE',
    productId: 'prod_02',
    productName: 'Fer à Béton Haute Adhérence 12mm',
    quantity: 80,
    unitCost: 6050,
    totalCost: 484000,
    newCmup: 6050,
    reason: 'Vente Chantiers BTP Kribi Port',
    performedBy: 'Mounir Kamdem'
  },
  {
    id: 'mvt_03',
    referenceDoc: 'INV-2026-09-TR',
    date: '2026-09-22',
    type: 'AJUSTEMENT',
    productId: 'prod_04',
    productName: 'Peinture Seigneurie Pantex 900 Blanc Mat - Fût 20L',
    quantity: -1,
    unitCost: 42800,
    totalCost: -42800,
    newCmup: 42800,
    reason: 'Casse accidentelle lors du déchargement camion',
    performedBy: 'Serge Atangana'
  },
  {
    id: 'mvt_04',
    referenceDoc: 'BL-NEX-019',
    date: '2026-09-20',
    type: 'ENTREE',
    productId: 'prod_05',
    productName: 'Câble Électrique Rigide Cuivre Nexans 3x2.5mm²',
    quantity: 30,
    unitCost: 31000,
    totalCost: 930000,
    newCmup: 31500,
    reason: 'Commande grossiste électricité Akwa',
    performedBy: 'Serge Atangana'
  }
];

export const mockInventoryRecords: InventoryRecord[] = [
  {
    id: 'inv_01',
    date: '2026-09-20',
    productId: 'prod_01',
    productName: 'Ciment Dangote 42.5R - Sac 50kg',
    theoreticalStock: 10,
    physicalStock: 8,
    variance: -2,
    varianceValueFCFA: -9600,
    status: 'ECART_MINEUR',
    notes: '2 sacs déchirés constatés au fond du hangar B'
  },
  {
    id: 'inv_02',
    date: '2026-09-20',
    productId: 'prod_02',
    productName: 'Fer à Béton Haute Adhérence 12mm',
    theoreticalStock: 350,
    physicalStock: 350,
    variance: 0,
    varianceValueFCFA: 0,
    status: 'CONFORME',
    notes: 'Comptage physique rigoureux effectué par lot de 50 barres'
  },
  {
    id: 'inv_03',
    date: '2026-09-20',
    productId: 'prod_04',
    productName: 'Peinture Seigneurie Pantex 900 Blanc Mat',
    theoreticalStock: 7,
    physicalStock: 6,
    variance: -1,
    varianceValueFCFA: -42800,
    status: 'ECART_MINEUR',
    notes: 'Fût endommagé consigné pour régularisation'
  },
  {
    id: 'inv_04',
    date: '2026-09-20',
    productId: 'prod_06',
    productName: 'Carrelage Grès Cérame Émaillé 60x60',
    theoreticalStock: 215,
    physicalStock: 210,
    variance: -5,
    varianceValueFCFA: -54000,
    status: 'ECART_CRITIQUE',
    notes: 'Audit de sécurité demandé: écart de 5 cartons sur le rayon extérieur'
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv_891',
    invoiceNumber: 'FACT-2026-0814',
    date: '2026-09-24',
    dueDate: '2026-10-10',
    clientId: 'cli_01',
    clientName: 'Génie Civil & BTP Cameroun SA',
    clientNIU: 'M010800029411P',
    clientPhone: '+237 6 99 80 12 34',
    clientCity: 'Douala (Bonanjo)',
    status: 'PAYEE',
    items: [
      {
        id: 'it_01',
        productId: 'prod_02',
        description: 'Fer à Béton Haute Adhérence 12mm (Barre 12m)',
        quantity: 120,
        unitPriceHT: 7200,
        totalHT: 864000
      },
      {
        id: 'it_02',
        productId: 'prod_01',
        description: 'Ciment Dangote 42.5R - Sac 50kg',
        quantity: 100,
        unitPriceHT: 5350,
        totalHT: 535000
      }
    ],
    totalHT: 1399000,
    tvaRate: 0.1925,
    tvaAmount: 269308,
    acompteRate: 0.022,
    acompteAmount: 30778,
    totalTTC: 1668308,
    netAPayer: 1637530, // totalTTC - acompte AIRS
    paymentMethod: 'VIREMENT_BANCAIRE',
    notes: 'Chantier Réhabilitation Immeuble SNI Bonanjo. Livraison sur site.'
  },
  {
    id: 'inv_892',
    invoiceNumber: 'FACT-2026-0815',
    date: '2026-09-23',
    dueDate: '2026-09-30',
    clientId: 'cli_02',
    clientName: 'Hôtel Résidence La Falaise Bastos',
    clientNIU: 'M031400091845K',
    clientPhone: '+237 6 75 12 43 90',
    clientCity: 'Yaoundé (Bastos)',
    status: 'EN_ATTENTE',
    items: [
      {
        id: 'it_03',
        productId: 'prod_04',
        description: 'Peinture Seigneurie Pantex 900 Blanc Mat - Fût 20L',
        quantity: 8,
        unitPriceHT: 54500,
        totalHT: 436000
      },
      {
        id: 'it_04',
        productId: 'prod_06',
        description: 'Carrelage Grès Cérame Émaillé 60x60 Gris Béton',
        quantity: 35,
        unitPriceHT: 14200,
        totalHT: 497000
      }
    ],
    totalHT: 933000,
    tvaRate: 0.1925,
    tvaAmount: 179603,
    acompteRate: 0.022,
    acompteAmount: 20526,
    totalTTC: 1112603,
    netAPayer: 1092077,
    paymentMethod: 'ORANGE_MONEY',
    notes: 'Rénovation Aile B Suite Prestige. Bon de commande PO-YAO-991.'
  },
  {
    id: 'inv_893',
    invoiceNumber: 'FACT-2026-0802',
    date: '2026-09-05',
    dueDate: '2026-09-20',
    clientId: 'cli_03',
    clientName: 'Quincaillerie Moderne de Mokolo',
    clientNIU: 'M081912440122R',
    clientPhone: '+237 6 79 33 00 11',
    clientCity: 'Yaoundé (Marché Mokolo)',
    status: 'EN_RETARD',
    items: [
      {
        id: 'it_05',
        productId: 'prod_03',
        description: 'Tôle Bac Aluminium Ondulé 0.45mm (Longueur 3m)',
        quantity: 50,
        unitPriceHT: 9900,
        totalHT: 495000
      },
      {
        id: 'it_06',
        productId: 'prod_05',
        description: 'Câble Électrique Nexans 3x2.5mm² (100m)',
        quantity: 10,
        unitPriceHT: 39500,
        totalHT: 395000
      }
    ],
    totalHT: 890000,
    tvaRate: 0.1925,
    tvaAmount: 171325,
    acompteRate: 0.022,
    acompteAmount: 19580,
    totalTTC: 1061325,
    netAPayer: 1041745,
    paymentMethod: 'MTN_MOMO',
    notes: 'Relance téléphonique effectuée le 21 Septembre. Promesse de virement MoMo non tenue.'
  },
  {
    id: 'inv_894',
    invoiceNumber: 'FACT-2026-0816',
    date: '2026-09-25',
    dueDate: '2026-10-15',
    clientId: 'cli_04',
    clientName: 'Société Agro-Pastorale du Noun (SAN)',
    clientNIU: 'M041100084511A',
    clientPhone: '+237 6 94 22 55 88',
    clientCity: 'Bafoussam',
    status: 'EN_ATTENTE',
    items: [
      {
        id: 'it_07',
        productId: 'prod_07',
        description: 'Tube PVC Évacuation Assainissement Ø110mm (4m)',
        quantity: 40,
        unitPriceHT: 5600,
        totalHT: 224000
      },
      {
        id: 'it_08',
        productId: 'prod_08',
        description: 'Disque à Tronçonner Métal Bosch Pro Ø230mm',
        quantity: 8,
        unitPriceHT: 16800,
        totalHT: 134400
      }
    ],
    totalHT: 358400,
    tvaRate: 0.1925,
    tvaAmount: 68992,
    acompteRate: 0.022,
    acompteAmount: 7885,
    totalTTC: 427392,
    netAPayer: 419507,
    paymentMethod: 'ESPECES',
    notes: 'Acompte de 200 000 FCFA reçu en espèces au comptoir de vente Akwa.'
  }
];

export const mockClients: Client[] = [
  {
    id: 'cli_01',
    name: 'Ingénieur Patrick Eboa',
    company: 'Génie Civil & BTP Cameroun SA',
    niu: 'M010800029411P',
    email: 'p.eboa@btpcameroon.cm',
    phone: '+237 6 99 80 12 34',
    city: 'Douala (Bonanjo)',
    segment: 'VIP',
    totalSpent: 14850000,
    outstandingBalance: 0,
    invoicesCount: 14,
    lastOrderDate: '2026-09-24',
    iaRecommendation: 'Client stratégique grand compte. Proposer un escompte de 2.5% sur la prochaine commande de ferraille de 5M FCFA.'
  },
  {
    id: 'cli_02',
    name: 'Mme Suzanne Mbarga',
    company: 'Hôtel Résidence La Falaise Bastos',
    niu: 'M031400091845K',
    email: 'direction@residence-falaise.cm',
    phone: '+237 6 75 12 43 90',
    city: 'Yaoundé (Bastos)',
    segment: 'REGULIER',
    totalSpent: 6420000,
    outstandingBalance: 1092077,
    invoicesCount: 7,
    lastOrderDate: '2026-09-23',
    iaRecommendation: 'Facture en attente à échéance le 30/09. Envoyer un rappel amical par WhatsApp automatique.'
  },
  {
    id: 'cli_03',
    name: 'El Hadj Oumarou Danpullo',
    company: 'Quincaillerie Moderne de Mokolo',
    niu: 'M081912440122R',
    email: 'oumarou.quinc@gmail.com',
    phone: '+237 6 79 33 00 11',
    city: 'Yaoundé (Mokolo)',
    segment: 'PERDU',
    totalSpent: 2890000,
    outstandingBalance: 1041745,
    invoicesCount: 3,
    lastOrderDate: '2026-09-05',
    iaRecommendation: '⚠️ Retard critique de paiement (>20 jours). Suspendre toute nouvelle livraison jusqu au règlement via MTN MoMo.'
  },
  {
    id: 'cli_04',
    name: 'Dr. Ernest Fomekong',
    company: 'Société Agro-Pastorale du Noun (SAN)',
    niu: 'M041100084511A',
    email: 'fomekong.agro@san-cm.com',
    phone: '+237 6 94 22 55 88',
    city: 'Bafoussam',
    segment: 'REGULIER',
    totalSpent: 4210000,
    outstandingBalance: 219507,
    invoicesCount: 5,
    lastOrderDate: '2026-09-25',
    iaRecommendation: 'Fréquence régulière chaque trimestre. Opportunité de lui proposer notre catalogue d irrigation PVC.'
  }
];

export const mockSuppliers: Supplier[] = [
  {
    id: 'sup_01',
    name: 'Dangote Cement Cameroon SA',
    category: 'Cimenterie & Liants',
    contactName: 'M. Jean-Paul Njock (Resp. Commercial Ouest)',
    phone: '+237 2 33 40 88 00',
    email: 'commandes.cameroun@dangote.com',
    city: 'Douala (Quai Bonabéri)',
    paymentTerms: 'Comptant à la commande',
    totalPurchased: 24500000,
    balanceOwed: 0
  },
  {
    id: 'sup_02',
    name: 'Prometal Aciérie Douala',
    category: 'Sidérurgie & Fer',
    contactName: 'Mme Christiane Tagne',
    phone: '+237 2 33 39 12 00',
    email: 'commercial@prometal-cm.com',
    city: 'Douala (Zone Industrielle Bassa)',
    paymentTerms: 'Paiement 30 jours fin de mois',
    totalPurchased: 18200000,
    balanceOwed: 2450000
  },
  {
    id: 'sup_03',
    name: 'Alubassa Aluminium Cameroun',
    category: 'Tôles & Métallurgie',
    contactName: 'M. Fabrice Manga',
    phone: '+237 6 99 30 45 12',
    email: 'contact@alubassa.cm',
    city: 'Douala (Bassa)',
    paymentTerms: 'Chèque certifié ou Virement 15j',
    totalPurchased: 11900000,
    balanceOwed: 950000
  },
  {
    id: 'sup_04',
    name: 'Société Camerounaise de Peintures (Seigneurie)',
    category: 'Chimie & Peintures',
    contactName: 'M. Eric Ndongo',
    phone: '+237 6 77 14 20 80',
    email: 'ventes@seigneurie-cm.com',
    city: 'Douala (Akwa)',
    paymentTerms: 'Orange Money Pro ou Virement',
    totalPurchased: 7600000,
    balanceOwed: 0
  }
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po_01',
    orderNumber: 'BC-2026-0312',
    supplierId: 'sup_01',
    supplierName: 'Dangote Cement Cameroon SA',
    date: '2026-09-22',
    deliveryDate: '2026-09-26',
    itemsCount: 300,
    totalAmount: 1425000,
    status: 'EN_COURS'
  },
  {
    id: 'po_02',
    orderNumber: 'BC-2026-0308',
    supplierId: 'sup_02',
    supplierName: 'Prometal Aciérie Douala',
    date: '2026-09-15',
    deliveryDate: '2026-09-18',
    itemsCount: 150,
    totalAmount: 885000,
    status: 'LIVRE'
  }
];

export const mockTreasuryAccounts: TreasuryAccount[] = [
  {
    id: 'acc_01',
    name: 'MTN Mobile Money Marchand',
    type: 'MTN_MOMO',
    accountNumber: '+237 6 77 41 89 22 (Code Marchand: 894102)',
    balance: 4890500,
    todayInflow: 650000,
    todayOutflow: 120000
  },
  {
    id: 'acc_02',
    name: 'Orange Money Pro Cameroun',
    type: 'ORANGE_MONEY',
    accountNumber: '+237 6 99 44 22 11 (Partenaire: 33901)',
    balance: 3240000,
    todayInflow: 410000,
    todayOutflow: 50000
  },
  {
    id: 'acc_03',
    name: 'Caisse Espèces Magasin Akwa',
    type: 'ESPECES',
    accountNumber: 'Caisse Centrale N°1 Douala',
    balance: 1425000,
    todayInflow: 320000,
    todayOutflow: 85000
  },
  {
    id: 'acc_04',
    name: 'Afriland First Bank (Compte Courant)',
    type: 'BANQUE',
    accountNumber: 'RIB: 10005 00012 04859012011 44',
    balance: 18450000,
    todayInflow: 1637530,
    todayOutflow: 950000
  }
];

export const mockTreasuryTransactions: TreasuryTransaction[] = [
  {
    id: 'tx_01',
    date: '2026-09-25',
    time: '11:15',
    accountId: 'acc_04',
    accountName: 'Afriland First Bank',
    channel: 'BANQUE',
    type: 'ENTREE',
    category: 'Règlement Facture Client',
    amount: 1637530,
    description: 'Virement reçu de Génie Civil & BTP (Facture FACT-2026-0814)',
    referenceNumber: 'AFR-VIR-99214',
    status: 'COMPLETE'
  },
  {
    id: 'tx_02',
    date: '2026-09-25',
    time: '09:40',
    accountId: 'acc_01',
    accountName: 'MTN Mobile Money Marchand',
    channel: 'MTN_MOMO',
    type: 'ENTREE',
    category: 'Vente Comptoir Express',
    amount: 320000,
    description: 'Achat outillage et tubes PVC M. Fotso',
    referenceNumber: 'MP260925.0940.B291',
    status: 'COMPLETE'
  },
  {
    id: 'tx_03',
    date: '2026-09-24',
    time: '16:20',
    accountId: 'acc_02',
    accountName: 'Orange Money Pro',
    channel: 'ORANGE_MONEY',
    type: 'SORTIE',
    category: 'Frais de Carburant & Livraison',
    amount: 50000,
    description: 'Ravitaillement Camionnette Isuzu Douala-Yaoundé',
    referenceNumber: 'OM-CI-20260924-411',
    status: 'COMPLETE'
  },
  {
    id: 'tx_04',
    date: '2026-09-23',
    time: '21:45',
    accountId: 'acc_03',
    accountName: 'Caisse Espèces Magasin Akwa',
    channel: 'ESPECES',
    type: 'SORTIE',
    category: 'Retrait sans justificatif immédiat',
    amount: 85000,
    description: 'Décaissement tardif de fermeture - Pièce justificative manquante',
    referenceNumber: 'CS-MAN-0923',
    status: 'SUSPECT'
  }
];

export const mockFraudAlerts: FraudAuditAlert[] = [
  {
    id: 'fa_01',
    severity: 'HAUTE',
    title: 'Anomalie de caisse : Décaissement nocturne sans bon validé',
    description: 'Une sortie d espèces de 85 000 FCFA a été enregistrée à 21h45 hors horaires normaux du magasin sans contreseing du gérant.',
    amountImpactFCFA: 85000,
    date: '2026-09-23 21:45',
    suggestedFix: 'Demander immédiatement la décharge signée au caissier ou procéder à la régularisation comptable.'
  },
  {
    id: 'fa_02',
    severity: 'MOYENNE',
    title: 'Écart de rapprochement MTN MoMo Marchand',
    description: 'Le journal des encaissements de la journée du 24/09 indique 670 000 FCFA alors que le solde reçu MTN affiche 650 000 FCFA (-20 000 FCFA).',
    amountImpactFCFA: 20000,
    date: '2026-09-24 18:30',
    suggestedFix: 'Vérifier si des frais de transaction ou un paiement annulé en cours n ont pas été décomptés.'
  },
  {
    id: 'fa_03',
    severity: 'FAIBLE',
    title: 'Double émission potentielle de facture proforma',
    description: 'Deux proformas identiques de 450 000 FCFA ont été générées pour le client SAN Bafoussam à 10 minutes d intervalle.',
    amountImpactFCFA: 450000,
    date: '2026-09-25 08:20',
    suggestedFix: 'Archiver le doublon pour éviter une comptabilisation erronée de créance client.'
  }
];

export const mockEmployees: Employee[] = [
  {
    id: 'emp_01',
    matricule: 'GC-EMP-001',
    firstName: 'Serge',
    lastName: 'Atangana',
    role: 'Chef Magasinier & Gestionnaire de Stock',
    department: 'Logistique & Entrepôt',
    phone: '+237 6 71 22 33 44',
    hireDate: '2022-03-15',
    baseSalary: 180000,
    attendance: 'PRESENT',
    cnpsNumber: '372-910284-B',
    primeTransport: 25000,
    primeRendement: 20000,
    deductionCNPS: 7560, // 4.2% du salaire brut plafonné
    deductionIRPP: 6400,
    deductionCAC: 640, // 10% IRPP
    netAPayer: 210400
  },
  {
    id: 'emp_02',
    matricule: 'GC-EMP-002',
    firstName: 'Bernadette',
    lastName: 'Ndjomo',
    role: 'Comptable & Responsable Facturation OHADA',
    department: 'Finance & Administration',
    phone: '+237 6 95 44 88 12',
    hireDate: '2023-01-10',
    baseSalary: 250000,
    attendance: 'PRESENT',
    cnpsNumber: '481-209144-C',
    primeTransport: 30000,
    primeRendement: 35000,
    deductionCNPS: 10500,
    deductionIRPP: 12800,
    deductionCAC: 1280,
    netAPayer: 290420
  },
  {
    id: 'emp_03',
    matricule: 'GC-EMP-003',
    firstName: 'Arnaud',
    lastName: 'Kamga',
    role: 'Commercial Grands Comptes Douala-Sud',
    department: 'Ventes',
    phone: '+237 6 77 90 11 22',
    hireDate: '2024-06-01',
    baseSalary: 200000,
    attendance: 'RETARD',
    cnpsNumber: '519-882019-A',
    primeTransport: 35000,
    primeRendement: 45000,
    deductionCNPS: 8400,
    deductionIRPP: 9200,
    deductionCAC: 920,
    netAPayer: 261480
  },
  {
    id: 'emp_04',
    matricule: 'GC-EMP-004',
    firstName: 'Chantal',
    lastName: 'Bissene',
    role: 'Caissière Centrale Magasin Akwa',
    department: 'Caisse & Trésorerie',
    phone: '+237 6 93 11 00 99',
    hireDate: '2023-08-20',
    baseSalary: 150000,
    attendance: 'PRESENT',
    cnpsNumber: '612-401928-D',
    primeTransport: 20000,
    primeRendement: 15000,
    deductionCNPS: 6300,
    deductionIRPP: 4500,
    deductionCAC: 450,
    netAPayer: 173750
  }
];

export const mockSalesMonthly = [
  { month: 'Oct 25', sales: 14200000, target: 12000000 },
  { month: 'Nov 25', sales: 16800000, target: 13000000 },
  { month: 'Déc 25', sales: 22400000, target: 18000000 },
  { month: 'Jan 26', sales: 12100000, target: 11000000 },
  { month: 'Fév 26', sales: 13900000, target: 12500000 },
  { month: 'Mar 26', sales: 15400000, target: 14000000 },
  { month: 'Avr 26', sales: 17200000, target: 15000000 },
  { month: 'Mai 26', sales: 16900000, target: 15500000 },
  { month: 'Juin 26', sales: 19100000, target: 16000000 },
  { month: 'Juil 26', sales: 18300000, target: 16500000 },
  { month: 'Août 26', sales: 17800000, target: 17000000 },
  { month: 'Sep 26', sales: 21450000, target: 18000000 }
];

export const mockAIChatHistory: AIMessage[] = [
  {
    id: 'ai_msg_01',
    sender: 'gestcam_ai',
    text: "Bonjour Mounir ! Je suis votre copilote GestCam IA pour votre PME au Cameroun. J'ai analysé vos opérations des dernières 24 heures :\n\n1. ⚠️ **Alerte Stock critique** : Le Ciment Dangote (8 sacs) et la Peinture Seigneurie (6 fûts) sont en dessous de votre seuil minimal.\n2. 💰 **Trésorerie active** : Solde total consolidé de 28 005 500 FCFA à 11h30.\n3. 📊 **Conformité OHADA** : Vos déclarations de TVA (19.25%) et d'Acompte AIRS (2.2%) sont prêtes pour le relevé mensuel CIME Douala 1.\n\nSur quoi souhaitez-vous agir aujourd'hui ?",
    timestamp: '2026-09-25 09:30',
    chips: [
      'Générer bon de commande Dangote',
      'Auditer les impayés clients > 15 jours',
      'Calculer la marge globale par famille',
      'Préparer déclaration TVA OHADA'
    ]
  }
];
