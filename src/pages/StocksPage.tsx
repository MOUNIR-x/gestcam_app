import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, Product, StockMovement, InventoryRecord } from '../types';
import { Drawer } from '../components/ui/Drawer';
import {
  Package,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardList,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  Search,
  FileText
} from 'lucide-react';

export const StocksPage: React.FC = () => {
  const {
    products,
    stockMovements,
    inventoryRecords,
    addStockMovement,
    addInventoryRecord,
    lowStockCount
  } = useApp();

  const [activeTab, setActiveTab] = useState<'STOCKS' | 'MOUVEMENTS' | 'INVENTAIRE'>('STOCKS');
  const [filterAlertOnly, setFilterAlertOnly] = useState(false);
  const [search, setSearch] = useState('');

  // Drawer "Entrée de stock" states
  const [isEntryDrawerOpen, setEntryDrawerOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [incomingQty, setIncomingQty] = useState<number>(100);
  const [incomingUnitCost, setIncomingUnitCost] = useState<number>(4750);
  const [reason, setReason] = useState('Réapprovisionnement usine grossiste');
  const [referenceDoc, setReferenceDoc] = useState('BL-2026-');

  // Selected product reference for dynamic CMUP calculation
  const targetProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Dynamic CMUP Calculation
  // New CMUP = ((CurrentStock * CurrentCMUP) + (IncomingQty * IncomingPrice)) / (CurrentStock + IncomingQty)
  const existingStock = targetProduct ? targetProduct.stockCurrent : 0;
  const existingCmup = targetProduct ? targetProduct.cmup : 0;
  const existingValue = existingStock * existingCmup;
  const incomingValue = incomingQty * incomingUnitCost;
  const totalStockAfter = existingStock + incomingQty;
  const computedNewCmup = totalStockAfter > 0
    ? Math.round((existingValue + incomingValue) / totalStockAfter)
    : incomingUnitCost;

  // Total stock inventory value at CMUP
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.stockCurrent * p.cmup,
    0
  );

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.reference.toLowerCase().includes(search.toLowerCase());
    const matchAlert = !filterAlertOnly || p.stockCurrent <= p.stockMin;
    return matchSearch && matchAlert;
  });

  const handleStockEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProduct || incomingQty <= 0) return;

    addStockMovement({
      referenceDoc: referenceDoc.trim() || `BL-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      type: 'ENTREE',
      productId: targetProduct.id,
      productName: targetProduct.name,
      quantity: incomingQty,
      unitCost: incomingUnitCost,
      totalCost: incomingValue,
      newCmup: computedNewCmup,
      reason,
      performedBy: 'Mounir Kamdem'
    });

    setEntryDrawerOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Gestion des Stocks & Méthode CMUP
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Valorisation au Coût Moyen Unitaire Pondéré et suivi des mouvements en temps réel.
          </p>
        </div>

        <button
          onClick={() => {
            if (targetProduct) {
              setIncomingUnitCost(targetProduct.purchasePrice);
            }
            setEntryDrawerOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvelle Entrée de Stock</span>
        </button>
      </div>

      {/* KPI Cards for Stock Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Valeur Totale du Stock (au CMUP)
          </div>
          <div className="mt-2 text-2xl font-bold font-mono-num text-slate-900 dark:text-white">
            {formatFCFA(totalInventoryValue)}
          </div>
          <div className="mt-1 text-xs text-blue-600 font-semibold">
            {products.length} références actives
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Ruptures & Alertes de Stock
          </div>
          <div className="mt-2 text-2xl font-bold font-mono-num text-rose-600 dark:text-rose-400">
            {lowStockCount} article{lowStockCount > 1 ? 's' : ''}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Seuil de sécurité atteint
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Dernier Inventaire Physique
          </div>
          <div className="mt-2 text-2xl font-bold font-mono-num text-slate-900 dark:text-white">
            20 Sept. 2026
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-semibold">
            Audité par le Commissaire aux comptes
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('STOCKS')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'STOCKS'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          1. État des Stocks ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('MOUVEMENTS')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'MOUVEMENTS'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          2. Journal des Mouvements ({stockMovements.length})
        </button>
        <button
          onClick={() => setActiveTab('INVENTAIRE')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'INVENTAIRE'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          3. Inventaire Physique & Écarts ({inventoryRecords.length})
        </button>
      </div>

      {/* TAB 1: STOCKS LIST */}
      {activeTab === 'STOCKS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par référence, désignation..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={() => setFilterAlertOnly(!filterAlertOnly)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                filterAlertOnly
                  ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {filterAlertOnly ? 'Afficher tous les stocks' : 'Filtrer : Ruptures uniquement'}
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Réf.</th>
                    <th className="py-3 px-4">Désignation</th>
                    <th className="py-3 px-4 text-center">Stock Actuel</th>
                    <th className="py-3 px-4 text-center">Seuil Min</th>
                    <th className="py-3 px-4 text-right">
                      <span className="text-blue-600 dark:text-blue-400">CMUP Unitaire</span>
                    </th>
                    <th className="py-3 px-4 text-right">Valeur Stock HT</th>
                    <th className="py-3 px-4 text-center">Statut</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Package className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="font-medium text-slate-600 dark:text-slate-300 text-sm">Aucun produit en stock</p>
                        <p className="text-xs text-slate-400 mt-0.5">Ajoutez un premier article à votre catalogue pour suivre le stock et le CMUP</p>
                        <button
                          onClick={() => {
                            setSelectedProductId('');
                            setEntryDrawerOpen(true);
                          }}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Ajouter / Entrée de Stock</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isLow = p.stockCurrent <= p.stockMin;
                      const stockValue = p.stockCurrent * p.cmup;
                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                        >
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {p.reference}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {p.category} · {p.unit}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                          <span className={isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}>
                            {p.stockCurrent}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-400">
                          {p.stockMin}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50/20 dark:bg-blue-950/20">
                          {formatFCFA(p.cmup)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatFCFA(stockValue)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                              isLow
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {isLow ? 'Alerte Rupture' : 'Conforme'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedProductId(p.id);
                              setIncomingUnitCost(p.purchasePrice);
                              setEntryDrawerOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-md transition-colors cursor-pointer"
                          >
                            + Entrée
                          </button>
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOUVEMENTS */}
      {activeTab === 'MOUVEMENTS' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">N° Document</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4 text-right">Quantité</th>
                  <th className="py-3 px-4 text-right">Coût Unitaire</th>
                  <th className="py-3 px-4 text-right">Nouveau CMUP</th>
                  <th className="py-3 px-4">Motif & Opérateur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stockMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {m.date}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                      {m.referenceDoc}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                          m.type === 'ENTREE'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : m.type === 'SORTIE'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {m.type === 'ENTREE' ? (
                          <ArrowDownLeft className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        {m.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {m.productName}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {m.type === 'SORTIE' ? `-${m.quantity}` : `+${m.quantity}`}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                      {formatFCFA(m.unitCost)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                      {formatFCFA(m.newCmup)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 dark:text-slate-200">{m.reason}</div>
                      <div className="text-[10px] text-slate-400">Par: {m.performedBy}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INVENTAIRE & ÉCARTS */}
      {activeTab === 'INVENTAIRE' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Contrôle des Écarts d Inventaire Physique
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparaison automatique entre le stock théorique logiciel et le comptage physique sur palette.
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              Dernier contrôle : 20/09/2026
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Article</th>
                    <th className="py-3 px-4 text-center">Stock Théorique</th>
                    <th className="py-3 px-4 text-center">Comptage Physique</th>
                    <th className="py-3 px-4 text-center">Écart (Qté)</th>
                    <th className="py-3 px-4 text-right">Impact Valeur FCFA</th>
                    <th className="py-3 px-4 text-center">Statut</th>
                    <th className="py-3 px-4">Justification / Constat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {inventoryRecords.map((rec) => {
                    const isConforme = rec.variance === 0;
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {rec.productName}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          {rec.theoreticalStock}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                          {rec.physicalStock}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          <span
                            className={
                              isConforme
                                ? 'text-emerald-600'
                                : rec.variance > 0
                                ? 'text-blue-600'
                                : 'text-rose-600'
                            }
                          >
                            {rec.variance > 0 ? `+${rec.variance}` : rec.variance}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          <span className={rec.varianceValueFCFA < 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}>
                            {formatFCFA(rec.varianceValueFCFA)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                              isConforme
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : rec.status === 'ECART_CRITIQUE'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {rec.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-[11px]">
                          {rec.notes}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: ENTRÉE DE STOCK & CALCUL DU CMUP EN TEMPS RÉEL */}
      <Drawer
        isOpen={isEntryDrawerOpen}
        onClose={() => setEntryDrawerOpen(false)}
        title="Enregistrer une Entrée de Stock"
        subtitle="Calcul automatique du nouveau CMUP selon les normes comptables OHADA."
        footer={
          <>
            <button
              type="button"
              onClick={() => setEntryDrawerOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Annuler
            </button>
            <button
              form="stockEntryForm"
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
            >
              Valider l Entrée et le CMUP
            </button>
          </>
        }
      >
        <form id="stockEntryForm" onSubmit={handleStockEntrySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Article à approvisionner *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                const found = products.find((p) => p.id === e.target.value);
                if (found) setIncomingUnitCost(found.purchasePrice);
              }}
              className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.reference} - {p.name} (Stock actuel: {p.stockCurrent})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                N° Bon de Livraison (BL) *
              </label>
              <input
                type="text"
                required
                value={referenceDoc}
                onChange={(e) => setReferenceDoc(e.target.value)}
                placeholder="ex: BL-DAN-2026-95"
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Quantité livrée ({targetProduct?.unit}) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={incomingQty}
                onChange={(e) => setIncomingQty(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Prix d Achat Unitaire Hors Taxes de cette livraison (FCFA) *
            </label>
            <input
              type="number"
              min="1"
              required
              value={incomingUnitCost}
              onChange={(e) => setIncomingUnitCost(Number(e.target.value))}
              className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
            />
          </div>

          {/* DYNAMIC CMUP CALCULATION DISPLAY */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-blue-600" />
                Formule de calcul dynamique du CMUP :
              </span>
              <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                OHADA SYSCOHADA
              </span>
            </div>

            <div className="text-[11px] font-mono bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-blue-200/60 dark:border-blue-900/60 text-slate-800 dark:text-slate-200 leading-relaxed">
              <div>Stock actuel : {existingStock} × {formatFCFA(existingCmup)} = {formatFCFA(existingValue)}</div>
              <div>Entrée : +{incomingQty} × {formatFCFA(incomingUnitCost)} = {formatFCFA(incomingValue)}</div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-1 mt-1 font-bold text-blue-700 dark:text-blue-300">
                Nouveau Stock Total : {totalStockAfter} {targetProduct?.unit}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Nouveau CMUP recalculé :
              </span>
              <span className="text-base font-bold font-mono text-blue-700 dark:text-blue-300">
                {formatFCFA(computedNewCmup)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Motif / Observation de réception
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>
        </form>
      </Drawer>
    </div>
  );
};
