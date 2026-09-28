// GestCam Frontend API Service
// Connects UI with backend REST endpoints with graceful offline fallback

export interface TaxCalculationResult {
  totalHT: number;
  tvaRate: number;
  tvaAmount: number;
  totalTTC: number;
  acompteRate: number;
  acompteAmount: number;
  netAPayer: number;
  isUnregisteredClient: boolean;
  notes: string;
}

export interface TaxDeclarationSummary {
  periode: string;
  dateEcheance: string;
  company: {
    name: string;
    niu: string;
    rccm: string;
    cdi: string;
    regime: string;
  };
  declaration: {
    chiffreAffairesHT: number;
    tvaCollectee19_25: number;
    tvaDeductible: number;
    tvaNetteADeclarer: number;
    acompteAIRS2_2: number;
    droitTimbreFiscal: number;
    facturesDeclareesCount: number;
    totalAPayerDGI: number;
  };
  conformite: {
    statut: string;
    referenceLegale: string;
    conseil: string;
  };
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('gestcam_token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(endpoint, {
      headers,
      ...options
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Erreur réseau' }));
      throw new Error(errorData.error || `Erreur HTTP ${res.status}`);
    }

    return res.json();
  }

  // Health
  async getHealth() {
    return this.request<{ status: string; service: string; system: string }>('/api/health');
  }

  // Auth & Company
  async getCompanyProfile() {
    return this.request<{ user: any; company: any }>('/api/auth/me');
  }

  async updateCompany(data: any) {
    return this.request<{ company: any; message: string }>('/api/auth/company', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Invoices & Tax Engine
  async calculateInvoiceTax(data: { items: any[]; applyTva?: boolean; applyAcompte?: boolean; clientNIU?: string }) {
    return this.request<TaxCalculationResult>('/api/invoices/calculate', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async createInvoice(data: any) {
    return this.request<{ invoice: any; message: string }>('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateInvoiceStatus(id: string, status: string, paymentMethod?: string) {
    return this.request<{ invoice: any; message: string }>(`/api/invoices/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, paymentMethod })
    });
  }

  // Stocks & Inventory
  async addProduct(product: any) {
    return this.request<{ product: any; message: string }>('/api/stocks/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
  }

  async recordStockMovement(mvt: any) {
    return this.request<{ movement: any; updatedProduct: any; message: string }>('/api/stocks/movements', {
      method: 'POST',
      body: JSON.stringify(mvt)
    });
  }

  async recordInventoryReconciliation(data: { productId: string; physicalStock: number; notes?: string }) {
    return this.request<{ record: any; adjustedStock: number; message: string }>('/api/stocks/inventory-reconciliation', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Treasury
  async getTreasuryOverview() {
    return this.request<any>('/api/treasury/overview');
  }

  async recordTreasuryTransaction(tx: any) {
    return this.request<{ transaction: any; updatedAccount: any; message: string }>('/api/treasury/transactions', {
      method: 'POST',
      body: JSON.stringify(tx)
    });
  }

  async resolveFraudAlert(alertId: string) {
    return this.request<{ resolvedAlert: any; message: string }>(`/api/treasury/alerts/${alertId}/resolve`, {
      method: 'POST'
    });
  }

  // Mobile Money
  async collectMobileMoney(data: { invoiceId?: string; phoneNumber: string; operator?: string; amount: number }) {
    return this.request<{ success: boolean; payment: any; message: string }>('/api/mobile-money/collect', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Monthly DGI Tax Return
  async getTaxDeclaration(): Promise<TaxDeclarationSummary> {
    return this.request<TaxDeclarationSummary>('/api/tax/declaration-mensuelle');
  }

  // Gemini AI Copilot
  async askCopilot(message: string): Promise<{ reply: string; source: string; timestamp: string }> {
    return this.request<{ reply: string; source: string; timestamp: string }>('/api/ai/copilot', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }
}

export const api = new ApiService();
