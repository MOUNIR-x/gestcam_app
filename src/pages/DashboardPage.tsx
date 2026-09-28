import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA } from '../types';
import { KPICard } from '../components/ui/KPICard';
import { BadgeIA } from '../components/ui/BadgeIA';
import { WhatsAppButton } from '../components/ui/WhatsAppButton';
import {
  TrendingUp,
  Wallet,
  AlertOctagon,
  FileCheck2,
  ArrowRight,
  Plus,
  ArrowUpRight,
  Calendar,
  Sparkles,
  Layers
} from 'lucide-react';

const buildMonthlySales = (invoices: any[]) => {
  const labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const monthMap = new Map(labels.map((label, index) => [label, { month: label, sales: 0, target: 0 }]));

  invoices.forEach((invoice) => {
    const date = new Date(invoice.date);
    if (Number.isNaN(date.getTime())) return;
    const monthLabel = labels[date.getMonth()];
    const current = monthMap.get(monthLabel) || { month: monthLabel, sales: 0, target: 0 };
    current.sales += Number(invoice.totalHT || 0);
    monthMap.set(monthLabel, current);
  });

  return labels.map((label) => monthMap.get(label) || { month: label, sales: 0, target: 0 });
};

export const DashboardPage: React.FC = () => {
  const {
    invoices,
    products,
    treasuryAccounts,
    clients,
    navigate,
    lowStockCount
  } = useApp();

  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // Compute total consolidated treasury
  const totalTreasury = treasuryAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Compute outstanding client receivables
  const totalReceivables = invoices
    .filter((inv) => inv.status === 'EN_ATTENTE' || inv.status === 'EN_RETARD')
    .reduce((sum, inv) => sum + inv.netAPayer, 0);

  // Monthly sales calculation from recorded invoices
  const currentMonthSales = invoices.reduce((sum, inv) => sum + inv.totalHT, 0);
  const pendingInvoices = invoices.filter((inv) => inv.status === 'EN_ATTENTE' || inv.status === 'EN_RETARD');

  const salesMonthly = useMemo(() => buildMonthlySales(invoices), [invoices]);
  const maxSales = Math.max(1, ...salesMonthly.flatMap((m) => [m.sales, m.target]));

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Tableau de Bord Exécutif
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Aperçu en temps réel de votre activité commerciale et trésorerie au Cameroun.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/facturation')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouvelle Facture</span>
          </button>
          <button
            onClick={() => navigate('/stocks')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Entrée Stock</span>
          </button>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Chiffre d'Affaires Réalisé"
          value={formatFCFA(currentMonthSales)}
          subtitle={`${invoices.length} facture${invoices.length > 1 ? 's' : ''} émise${invoices.length > 1 ? 's' : ''}`}
          icon={TrendingUp}
          onClick={() => navigate('/facturation')}
        />

        <KPICard
          title="Trésorerie Consolidée"
          value={formatFCFA(totalTreasury)}
          subtitle="4 comptes (MoMo, OM, Caisse, Banque)"
          icon={Wallet}
          onClick={() => navigate('/tresorerie')}
        />

        <KPICard
          title="Créances Clients en Cours"
          value={formatFCFA(totalReceivables)}
          subtitle={`${pendingInvoices.length} facture${pendingInvoices.length > 1 ? 's' : ''} en attente`}
          icon={FileCheck2}
          onClick={() => navigate('/facturation')}
        />

        <KPICard
          title="Alertes de Stock"
          value={`${lowStockCount} article${lowStockCount > 1 ? 's' : ''}`}
          subtitle="Sous le seuil minimal de sécurité"
          icon={AlertOctagon}
          badge={
            lowStockCount > 0 ? (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                Action requise
              </span>
            ) : undefined
          }
          onClick={() => navigate('/stocks')}
        />
      </div>

      {/* IA Strategy & Recommendation Card */}
      <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-purple-600 text-white shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-950 dark:text-purple-200">
                Copilote IA : Recommandation Opérationnelle Prioritaire
              </span>
              <BadgeIA size="sm" label="Claude 3.7 Engine" />
            </div>
            <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
              Le stock de <strong>Ciment Dangote 50kg</strong> (8 sacs) atteint son niveau critique. À votre rythme de vente actuel, vous serez en rupture d ici 48 heures. Nous vous recommandons de valider un bon de commande de 200 sacs auprès de Dangote Bonabéri.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/stocks')}
            className="px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors cursor-pointer"
          >
            Réapprovisionner
          </button>
          <button
            onClick={() => navigate('/ia')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 shadow-xs transition-colors cursor-pointer"
          >
            Discuter avec l IA →
          </button>
        </div>
      </div>

      {/* Sales Evolution Chart & Breakdown */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              Évolution des Ventes Mensuelles (12 derniers mois)
            </h2>
            <p className="text-xs text-slate-500">
              Montants exprimés en Francs CFA (HT) avec seuil d objectif commercial.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-blue-600" /> Ventes réalisées
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-amber-400" /> Objectif fixé
            </span>
          </div>
        </div>

        {/* Clean SVG / Bar Chart */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[500px] h-64 flex items-end gap-2 sm:gap-4 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
            {salesMonthly.map((item, idx) => {
              const heightPercent = Math.round((item.sales / maxSales) * 100);
              const targetHeightPercent = Math.round((item.target / maxSales) * 100);
              const isHovered = hoveredMonth === idx;

              return (
                <div
                  key={item.month}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                  onMouseEnter={() => setHoveredMonth(idx)}
                  onMouseLeave={() => setHoveredMonth(null)}
                >
                  {/* Floating tooltip on hover */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-mono shadow-xl pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95">
                      <div className="font-bold">{item.month}</div>
                      <div className="text-blue-300">Ventes : {formatFCFA(item.sales)}</div>
                      <div className="text-amber-300">Objectif : {formatFCFA(item.target)}</div>
                    </div>
                  )}

                  {/* Target line tick */}
                  <div
                    className="absolute w-full border-t-2 border-dashed border-amber-400/80 z-10 pointer-events-none"
                    style={{ bottom: `${targetHeightPercent}%` }}
                  />

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[38px] rounded-t-md transition-all duration-200 ${
                      idx === salesMonthly.length - 1
                        ? 'bg-blue-600 dark:bg-blue-500 shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 hover:bg-blue-400 dark:hover:bg-blue-600'
                    }`}
                  />

                  {/* Month label */}
                  <span className="mt-2 text-[10px] font-mono text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Invoices & Quick Client Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Invoices Table */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                Dernières Factures Émises (OHADA)
              </h2>
              <p className="text-xs text-slate-500">TVA 19.25% et Retenue AIRS 2.2% calculées.</p>
            </div>
            <button
              onClick={() => navigate('/facturation')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="pb-2">Réf. Facture</th>
                  <th className="pb-2">Client</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2 text-right">Net à Payer</th>
                  <th className="pb-2 text-center">Statut</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      <p className="font-medium text-slate-500 text-xs">Aucune facture émise pour le moment</p>
                      <button
                        onClick={() => navigate('/facturation')}
                        className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        + Créer votre première facture OHADA
                      </button>
                    </td>
                  </tr>
                ) : (
                  invoices.slice(0, 4).map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 font-mono font-semibold text-slate-900 dark:text-white">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-slate-900 dark:text-white truncate max-w-[170px]">
                          {inv.clientName}
                        </div>
                        <div className="text-[10px] text-slate-400">{inv.clientCity}</div>
                      </td>
                      <td className="py-3 text-slate-500 font-mono">
                        {inv.date}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatFCFA(inv.netAPayer)}
                      </td>
                      <td className="py-3 text-center">
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
                      <td className="py-3 text-right">
                        <WhatsAppButton
                          phone={inv.clientPhone}
                          size="sm"
                          label="WhatsApp"
                          message={`Bonjour, voici le rappel de votre facture ${inv.invoiceNumber} d'un montant net de ${formatFCFA(inv.netAPayer)}. Règlement par MTN MoMo ou Orange Money possible.`}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Client Insights & Treasury Overview */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Répartition Trésorerie
              </h3>
              <button
                onClick={() => navigate('/tresorerie')}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                Gérer →
              </button>
            </div>

            <div className="space-y-2.5 pt-1">
              {treasuryAccounts.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        acc.type === 'MTN_MOMO'
                          ? 'bg-yellow-400'
                          : acc.type === 'ORANGE_MONEY'
                          ? 'bg-orange-500'
                          : acc.type === 'BANQUE'
                          ? 'bg-blue-600'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {acc.name.split(' ')[0]} {acc.name.split(' ')[1]}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatFCFA(acc.balance)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Clients Stratégiques VIP
              </h3>
              <button
                onClick={() => navigate('/clients')}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                CRM →
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {clients.slice(0, 3).map((c) => (
                <div key={c.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[130px]">
                      {c.company}
                    </div>
                    <div className="text-[10px] text-slate-400">{c.city}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {formatFCFA(c.totalSpent)}
                    </div>
                    <span className="text-[9px] font-bold uppercase text-blue-600 dark:text-blue-400">
                      {c.segment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
