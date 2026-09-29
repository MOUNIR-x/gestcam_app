import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, Invoice, InvoiceItem, InvoiceStatus } from '../types';
import { Modal } from '../components/ui/Modal';
import { WhatsAppButton } from '../components/ui/WhatsAppButton';
import { api, TaxDeclarationSummary } from '../services/api';
import {
  FileText,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Building2,
  Printer,
  Share2,
  Download,
  Smartphone,
  Check,
  RefreshCw,
  Landmark
} from 'lucide-react';

export const FacturationPage: React.FC = () => {
  const {
    invoices,
    clients,
    products,
    addInvoice,
    updateInvoiceStatus,
    companySettings,
    collectMobileMoneyPayment,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<InvoiceStatus | 'TOUTES'>('TOUTES');
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [selectedInvoiceForPDF, setSelectedInvoiceForPDF] = useState<Invoice | null>(null);

  // Mobile Money Payment Modal State
  const [selectedInvoiceForMoMo, setSelectedInvoiceForMoMo] = useState<Invoice | null>(null);
  const [momoOperator, setMomoOperator] = useState<'MTN_MOMO' | 'ORANGE_MONEY'>('MTN_MOMO');
  const [momoPhone, setMomoPhone] = useState<string>('');
  const [isCollecting, setIsCollecting] = useState(false);

  // Tax Declaration Modal State
  const [isTaxModalOpen, setTaxModalOpen] = useState(false);
  const [taxData, setTaxData] = useState<TaxDeclarationSummary | null>(null);
  const [isTaxLoading, setIsTaxLoading] = useState(false);

  // New Invoice Form States
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [applyTva, setApplyTva] = useState(true);
  const [applyAcompte, setApplyAcompte] = useState(true);
  const [notes, setNotes] = useState('Règlement exigible à 15 jours par Virement, Chèque ou Mobile Money.');

  // Invoice items state
  const [items, setItems] = useState<Omit<InvoiceItem, 'id'>[]>([
    {
      productId: products[1]?.id || '',
      description: products[1]?.name || 'Fer à Béton 12mm',
      quantity: 50,
      unitPriceHT: products[1]?.sellingPrice || 7200,
      totalHT: 50 * (products[1]?.sellingPrice || 7200)
    }
  ]);

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  // Dynamic calculations strict OHADA
  const totalHT = items.reduce((sum, item) => sum + item.quantity * item.unitPriceHT, 0);
  const tvaRate = applyTva ? companySettings.tvaRate : 0; // 19.25%
  const tvaAmount = Math.round(totalHT * tvaRate);
  const totalTTC = totalHT + tvaAmount;
  const acompteRate = applyAcompte ? companySettings.acompteRate : 0; // 2.2% AIRS
  const acompteAmount = Math.round(totalHT * acompteRate);
  const netAPayer = totalTTC - acompteAmount; // Net décaissé après précompte légal

  const handleAddItem = () => {
    const defaultProduct = products[0];
    setItems((prev) => [
      ...prev,
      {
        productId: defaultProduct.id,
        description: defaultProduct.name,
        quantity: 1,
        unitPriceHT: defaultProduct.sellingPrice,
        totalHT: defaultProduct.sellingPrice
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;

        if (field === 'productId') {
          const prod = products.find((p) => p.id === value);
          if (prod) {
            return {
              ...item,
              productId: prod.id,
              description: prod.name,
              unitPriceHT: prod.sellingPrice,
              totalHT: item.quantity * prod.sellingPrice
            };
          }
        }

        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPriceHT') {
          updated.totalHT = updated.quantity * updated.unitPriceHT;
        }
        return updated;
      })
    );
  };

  const handleSaveInvoice = async (status: InvoiceStatus = 'EN_ATTENTE') => {
    if (items.length === 0 || totalHT <= 0) return;

    const newInv = await addInvoice({
      date: invoiceDate,
      dueDate,
      clientId: selectedClient.id,
      clientName: selectedClient.company,
      clientNIU: selectedClient.niu,
      clientPhone: selectedClient.phone,
      clientCity: selectedClient.city,
      status,
      items: items.map((it, idx) => ({ ...it, id: `it_${Date.now()}_${idx}` })),
      totalHT,
      tvaRate,
      tvaAmount,
      acompteRate,
      acompteAmount,
      totalTTC,
      netAPayer,
      notes
    });

    setCreateOpen(false);
    setSelectedInvoiceForPDF(newInv);
  };

  const handleOpenTaxModal = async () => {
    setTaxModalOpen(true);
    setIsTaxLoading(true);
    try {
      const summary = await api.getTaxDeclaration();
      setTaxData(summary);
    } catch {
      showToast('Impossible de charger la déclaration fiscale');
    } finally {
      setIsTaxLoading(false);
    }
  };

  const handleConfirmMobileMoney = async () => {
    if (!selectedInvoiceForMoMo) return;
    setIsCollecting(true);
    try {
      await collectMobileMoneyPayment({
        invoiceId: selectedInvoiceForMoMo.id,
        phoneNumber: momoPhone,
        operator: momoOperator,
        amount: selectedInvoiceForMoMo.netAPayer
      });
      setSelectedInvoiceForMoMo(null);
    } catch {
      // error handled in context
    } finally {
      setIsCollecting(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (activeTab === 'TOUTES') return true;
    return inv.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Ventes & Facturation Conforme OHADA
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Émission certifiée avec mentions fiscales, calcul TVA 19.25%, AIRS 2.2% et transmission WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenTaxModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Landmark className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Déclaration DGI</span>
          </button>

          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Créer une Facture</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {[
          { id: 'TOUTES', label: `Toutes (${invoices.length})` },
          {
            id: 'PAYEE',
            label: `Payées (${invoices.filter((i) => i.status === 'PAYEE').length})`
          },
          {
            id: 'EN_ATTENTE',
            label: `En Attente (${invoices.filter((i) => i.status === 'EN_ATTENTE').length})`
          },
          {
            id: 'EN_RETARD',
            label: `En Retard (${invoices.filter((i) => i.status === 'EN_RETARD').length})`
          }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* INVOICES TABLE */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">N° Facture</th>
                <th className="py-3 px-4">Client / Entreprise</th>
                <th className="py-3 px-4">Émission & Échéance</th>
                <th className="py-3 px-4 text-right">Total HT</th>
                <th className="py-3 px-4 text-right">TVA (19.25%)</th>
                <th className="py-3 px-4 text-right">AIRS (2.2%)</th>
                <th className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                  Net à Payer
                </th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-medium text-slate-600 dark:text-slate-300 text-sm">Aucune facture émise</p>
                    <p className="text-xs text-slate-400 mt-0.5">Commencez par créer votre première facture certifiée OHADA</p>
                    <button
                      onClick={() => setCreateOpen(true)}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Créer une Facture</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {inv.clientName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      NIU: {inv.clientNIU || 'Non renseigné'}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    <div>Émis: {inv.date}</div>
                    <div className="text-slate-400">Éch: {inv.dueDate}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {formatFCFA(inv.totalHT)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {formatFCFA(inv.tvaAmount)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-600 dark:text-amber-400 whitespace-nowrap">
                    -{formatFCFA(inv.acompteAmount)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {formatFCFA(inv.netAPayer)}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                        inv.status === 'PAYEE'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : inv.status === 'EN_RETARD'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {inv.status === 'PAYEE' ? 'Payée' : inv.status === 'EN_RETARD' ? 'En Retard' : 'En Attente'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                      {inv.status !== 'PAYEE' && (
                        <button
                          onClick={() => {
                            setSelectedInvoiceForMoMo(inv);
                            setMomoPhone(inv.clientPhone || '+237 679 33 00 11');
                          }}
                          title="Encaisser via MTN MoMo ou Orange Money"
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:text-amber-200 rounded-md transition-colors cursor-pointer"
                        >
                          <Smartphone className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>Encaisser</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedInvoiceForPDF(inv)}
                        title="Aperçu Facture PDF"
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <WhatsAppButton
                        phone={inv.clientPhone}
                        size="sm"
                        label="WhatsApp"
                        message={`Bonjour,\nVoici votre facture *${inv.invoiceNumber}* de *${companySettings.commercialName}*.\nMontant Net à Payer : *${formatFCFA(inv.netAPayer)}*.\nÉchéance : ${inv.dueDate}.\nMerci de procéder au règlement par MTN MoMo, Orange Money ou Virement.`}
                      />
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE INVOICE 2-COLUMN VIEW MODAL / DRAWER */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Nouvelle Facture de Vente (Conformité OHADA)
                </h2>
                <p className="text-xs text-slate-500">
                  {companySettings.name} · CIME Douala 1 · TVA 19.25% & AIRS 2.2%
                </p>
              </div>
              <button
                onClick={() => setCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold"
              >
                ✕ Fermer
              </button>
            </div>

            {/* 2-Column Content */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-h-[75vh] overflow-y-auto">
              {/* Left Column (2 spans): Client & Items */}
              <div className="lg:col-span-2 space-y-5">
                {/* Client info */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                      Client Destinataire
                    </label>
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="mt-1 w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.company} ({c.city})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                      Date d Émission
                    </label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="mt-1 w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                      Date d Échéance
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="mt-1 w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                    />
                  </div>
                </div>

                {/* Items list */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Lignes d Articles
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter une ligne</span>
                    </button>
                  </div>

                    <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center text-xs"
                      >
                        <div className="sm:col-span-5">
                          <label className="text-[10px] text-slate-400">Article</label>
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                            className="w-full mt-0.5 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-medium truncate text-slate-900 dark:text-white"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.unit}) - {formatFCFA(p.sellingPrice)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-3 sm:contents gap-2 items-center">
                          <div className="sm:col-span-2">
                            <label className="text-[10px] text-slate-400">Quantité</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(idx, 'quantity', Math.max(1, Number(e.target.value)))
                              }
                              className="w-full mt-0.5 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-[10px] text-slate-400">Prix HT</label>
                            <input
                              type="number"
                              value={item.unitPriceHT}
                              onChange={(e) =>
                                handleItemChange(idx, 'unitPriceHT', Number(e.target.value))
                              }
                              className="w-full mt-0.5 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="sm:col-span-2 text-right">
                            <label className="text-[10px] text-slate-400">Total HT</label>
                            <div className="mt-1 font-mono font-bold text-slate-900 dark:text-white truncate">
                              {formatFCFA(item.totalHT)}
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:col-span-1 justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                            title="Supprimer la ligne"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mentions de paiement & Coordonnées bancaires
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>

              {/* Right Column (1 span): OHADA Tax Engine & Summary */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">
                    Décompte Fiscal OHADA
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Vente HT :</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {formatFCFA(totalHT)}
                      </span>
                    </div>

                    {/* TVA toggle & calculation */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={applyTva}
                            onChange={(e) => setApplyTva(e.target.checked)}
                            className="accent-blue-600"
                          />
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            TVA Cameroun (19.25%)
                          </span>
                        </label>
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {formatFCFA(tvaAmount)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 ml-5">
                        Taux légal 17.5% + 10% CAC (Centimes Communaux)
                      </p>
                    </div>

                    <div className="flex justify-between font-semibold pt-1">
                      <span className="text-slate-700 dark:text-slate-300">Total TTC :</span>
                      <span className="font-mono text-slate-900 dark:text-white">
                        {formatFCFA(totalTTC)}
                      </span>
                    </div>

                    {/* AIRS Retenue toggle & calculation */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={applyAcompte}
                            onChange={(e) => setApplyAcompte(e.target.checked)}
                            className="accent-amber-500"
                          />
                          <span className="font-medium text-amber-700 dark:text-amber-400">
                            Acompte AIRS Retenu (2.2%)
                          </span>
                        </label>
                        <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                          -{formatFCFA(acompteAmount)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 ml-5">
                        Retenue à la source légale pour personne morale
                      </p>
                    </div>

                    {/* Final Net à Payer */}
                    <div className="pt-3 border-t-2 border-blue-600 dark:border-blue-400 flex items-baseline justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        Net à Décaisser :
                      </span>
                      <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
                        {formatFCFA(netAPayer)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleSaveInvoice('EN_ATTENTE')}
                      className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Enregistrer et Émettre la Facture
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveInvoice('PAYEE')}
                      className="w-full py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      Encaissée Immédiatement (MoMo / Caisse)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF PREVIEW MODAL */}
      {selectedInvoiceForPDF && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedInvoiceForPDF(null)}
          title={`Aperçu Facture OHADA : ${selectedInvoiceForPDF.invoiceNumber}`}
          maxWidth="3xl"
        >
          <div className="bg-white text-slate-900 p-6 md:p-8 rounded-xl border border-slate-200 shadow-inner font-sans space-y-6">
            {/* Header Document */}
            <div className="flex items-start justify-between border-b pb-6">
              <div>
                <h2 className="text-xl font-black tracking-tight text-blue-600">
                  {companySettings.name}
                </h2>
                <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                  <p>{companySettings.commercialName}</p>
                  <p>{companySettings.address}, {companySettings.city} - Cameroun</p>
                  <p>Tél : {companySettings.phone} · Email : {companySettings.email}</p>
                  <p className="font-mono font-semibold pt-1">
                    NIU : {companySettings.niu} | RCCM : {companySettings.rccm}
                  </p>
                  <p className="text-[10px] text-slate-500">Rattaché au : {companySettings.cdi}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-slate-900 text-white font-mono font-bold text-sm rounded-md">
                  FACTURE DE VENTE
                </div>
                <div className="mt-2 text-xs text-slate-600 font-mono space-y-0.5">
                  <p className="font-bold text-slate-900">N° {selectedInvoiceForPDF.invoiceNumber}</p>
                  <p>Date : {selectedInvoiceForPDF.date}</p>
                  <p>Échéance : {selectedInvoiceForPDF.dueDate}</p>
                </div>
              </div>
            </div>

            {/* Client Frame */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Facturé à :
              </span>
              <div className="mt-1 font-bold text-sm text-slate-900">
                {selectedInvoiceForPDF.clientName}
              </div>
              <div className="text-slate-600 mt-0.5">
                Ville : {selectedInvoiceForPDF.clientCity} · Tél : {selectedInvoiceForPDF.clientPhone}
              </div>
              <div className="font-mono text-slate-600">
                NIU Client : {selectedInvoiceForPDF.clientNIU || 'Consommateur final'}
              </div>
            </div>

            {/* Articles Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs min-w-[420px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                    <th className="py-2 px-3">Désignation</th>
                    <th className="py-2 px-3 text-center">Qté</th>
                    <th className="py-2 px-3 text-right">Prix Unitaire HT</th>
                    <th className="py-2 px-3 text-right">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoiceForPDF.items.map((it) => (
                    <tr key={it.id}>
                      <td className="py-2 px-3 font-medium">{it.description}</td>
                      <td className="py-2 px-3 text-center font-mono">{it.quantity}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatFCFA(it.unitPriceHT)}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold">{formatFCFA(it.totalHT)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Breakdown Table */}
            <div className="flex justify-end text-xs">
              <div className="w-72 space-y-1.5 border border-slate-200 rounded-lg p-3 bg-slate-50">
                <div className="flex justify-between">
                  <span className="text-slate-600">Montant Total HT :</span>
                  <span className="font-mono font-bold">{formatFCFA(selectedInvoiceForPDF.totalHT)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">TVA Cameroun (19.25%) :</span>
                  <span className="font-mono">{formatFCFA(selectedInvoiceForPDF.tvaAmount)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>Montant Total TTC :</span>
                  <span className="font-mono">{formatFCFA(selectedInvoiceForPDF.totalTTC)}</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>Acompte AIRS déduit (2.2%) :</span>
                  <span className="font-mono">-{formatFCFA(selectedInvoiceForPDF.acompteAmount)}</span>
                </div>
                <div className="flex justify-between border-t-2 border-blue-600 pt-1 text-sm font-bold text-blue-900">
                  <span>Net à Payer (FCFA) :</span>
                  <span className="font-mono">{formatFCFA(selectedInvoiceForPDF.netAPayer)}</span>
                </div>
              </div>
            </div>

            {/* Legal Notice and Signatures */}
            <div className="pt-4 border-t text-[11px] text-slate-500 grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-slate-700">Conditions de règlement :</p>
                <p>{selectedInvoiceForPDF.notes}</p>
                <p className="mt-1">Paiements acceptés : MTN Mobile Money, Orange Money, Afriland First Bank.</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-700">Cachet & Signature Direction</p>
                <div className="h-14 mt-1 border border-dashed border-slate-300 rounded-md flex items-center justify-center text-[10px] text-slate-400">
                  Pour BatiCam Distribution Sarl
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 flex items-center justify-between border-t print:hidden">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer</span>
                </button>
              </div>

              <WhatsAppButton
                phone={selectedInvoiceForPDF.clientPhone}
                label="Envoyer au Client via WhatsApp"
                message={`Bonjour,\nVoici votre facture officielle *${selectedInvoiceForPDF.invoiceNumber}* de *${companySettings.commercialName}*.\nMontant Net à Payer : *${formatFCFA(selectedInvoiceForPDF.netAPayer)}*.\nÉchéance : ${selectedInvoiceForPDF.dueDate}.\nMerci pour votre fidélité.`}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* MOBILE MONEY MODAL */}
      {selectedInvoiceForMoMo && (
        <Modal
          isOpen={true}
          onClose={() => !isCollecting && setSelectedInvoiceForMoMo(null)}
          title="Encaissement Mobile Money Direct (Cameroun)"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Facture :</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {selectedInvoiceForMoMo.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Client :</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {selectedInvoiceForMoMo.clientName}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="font-semibold">Montant Net à Encaisser :</span>
                <span className="font-bold text-sm text-blue-600 dark:text-blue-400 font-mono">
                  {formatFCFA(selectedInvoiceForMoMo.netAPayer)}
                </span>
              </div>
            </div>

            {/* Operator selector */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Opérateur Mobile Money
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMomoOperator('MTN_MOMO')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    momoOperator === 'MTN_MOMO'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/40 text-yellow-900 dark:text-yellow-200 font-bold ring-2 ring-yellow-400/30'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold">MTN MoMo</div>
                  <div className="text-[10px] text-slate-400">67X, 65X, 68X...</div>
                </button>

                <button
                  type="button"
                  onClick={() => setMomoOperator('ORANGE_MONEY')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    momoOperator === 'ORANGE_MONEY'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200 font-bold ring-2 ring-orange-400/30'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold">Orange Money</div>
                  <div className="text-[10px] text-slate-400">69X, 655...</div>
                </button>
              </div>
            </div>

            {/* Phone Number Input */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Numéro de Téléphone du Client (Cameroun)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={momoPhone}
                  onChange={(e) => setMomoPhone(e.target.value)}
                  placeholder="+237 6XX XX XX XX"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Le client recevra une invite USSD sur son terminal pour saisir son code secret PIN.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isCollecting}
                onClick={() => setSelectedInvoiceForMoMo(null)}
                className="px-3 py-1.5 text-xs rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Annuler
              </button>

              <button
                type="button"
                disabled={isCollecting || !momoPhone}
                onClick={handleConfirmMobileMoney}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                {isCollecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Invite USSD envoyée...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Lancer l encaissement</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DGI TAX DECLARATION MODAL */}
      {isTaxModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setTaxModalOpen(false)}
          title="Télédéclaration Fiscale Mensuelle (DGI Cameroun)"
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {isTaxLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span>Calcul des agrégats fiscaux OHADA en cours...</span>
              </div>
            ) : taxData ? (
              <div className="space-y-4">
                {/* Enterprise Tax ID banner */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Raison Sociale</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{taxData.company.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">NIU Officiel</span>
                    <span className="font-mono font-bold text-blue-700 dark:text-blue-300">{taxData.company.niu}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Centre des Impôts</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{taxData.company.cdi}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Échéance DGI</span>
                    <span className="font-bold text-rose-600">{taxData.dateEcheance}</span>
                  </div>
                </div>

                {/* Tax Amounts Breakdown */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 font-semibold">
                    <span>Chiffre d Affaires HT Déclarable ({taxData.periode})</span>
                    <span className="font-mono">{formatFCFA(taxData.declaration.chiffreAffairesHT)}</span>
                  </div>

                  <div className="p-2.5 flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>1. TVA Brute Collectée (19.25% selon LF 2026)</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                      +{formatFCFA(taxData.declaration.tvaCollectee19_25)}
                    </span>
                  </div>

                  <div className="p-2.5 flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>2. TVA Déductible sur Achats & Charges</span>
                    <span className="font-mono text-emerald-600">
                      -{formatFCFA(taxData.declaration.tvaDeductible)}
                    </span>
                  </div>

                  <div className="p-2.5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <span className="font-medium">3. Solde TVA Nette à Déclarer</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatFCFA(taxData.declaration.tvaNetteADeclarer)}
                    </span>
                  </div>

                  <div className="p-2.5 flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>4. Acompte Spécial AIRS Retenu à la Source (2.2%)</span>
                    <span className="font-mono text-amber-600 font-semibold">
                      +{formatFCFA(taxData.declaration.acompteAIRS2_2)}
                    </span>
                  </div>

                  <div className="p-2.5 flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>5. Droits de Timbre Fiscal Gradué</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                      +{formatFCFA(taxData.declaration.droitTimbreFiscal)}
                    </span>
                  </div>

                  <div className="p-3 flex justify-between items-center bg-blue-50/80 dark:bg-blue-950/60 text-blue-950 dark:text-blue-100 font-bold text-sm">
                    <span>Net Total Exigible au Trésor Public (DGI)</span>
                    <span className="font-mono text-base font-extrabold text-blue-700 dark:text-blue-300">
                      {formatFCFA(taxData.declaration.totalAPayerDGI)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] text-amber-800 dark:text-amber-200">
                  <p className="font-semibold">Rappel Réglementaire :</p>
                  <p className="mt-0.5">{taxData.conformite.conseil}</p>
                </div>
              </div>
            ) : null}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `DÉCLARATION FISCALE DGI CAMEROUN - ${taxData?.company.name}\nNIU : ${taxData?.company.niu}\nCA HT : ${formatFCFA(taxData?.declaration.chiffreAffairesHT || 0)}\nTVA Nette : ${formatFCFA(taxData?.declaration.tvaNetteADeclarer || 0)}\nTotal DGI : ${formatFCFA(taxData?.declaration.totalAPayerDGI || 0)}`
                  );
                  showToast('Déclaration copiée dans le presse-papier');
                }}
                className="px-3 py-1.5 text-xs rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold cursor-pointer"
              >
                Copier le Récapitulatif
              </button>

              <button
                type="button"
                onClick={() => setTaxModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
