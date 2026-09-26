import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, PaymentChannelType, TreasuryAccount, TreasuryTransaction } from '../types';
import { BadgeIA } from '../components/ui/BadgeIA';
import { Drawer } from '../components/ui/Drawer';
import {
  Wallet,
  Smartphone,
  Landmark,
  Banknote,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Plus,
  RefreshCw,
  Search,
  Check
} from 'lucide-react';

export const TresoreriePage: React.FC = () => {
  const {
    treasuryAccounts,
    treasuryTransactions,
    fraudAlerts,
    resolveFraudAlert,
    addTreasuryTransaction,
    showToast
  } = useApp();

  const [isAddTxOpen, setAddTxOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(treasuryAccounts[0]?.id || '');
  const [txType, setTxType] = useState<'ENTREE' | 'SORTIE'>('ENTREE');
  const [amount, setAmount] = useState<number>(150000);
  const [category, setCategory] = useState('Encaissement Vente');
  const [description, setDescription] = useState('');
  const [refNumber, setRefNumber] = useState(`MOMO-${Date.now().toString().slice(-6)}`);

  const totalConsolidated = treasuryAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Channel icons & colors
  const getChannelDetails = (type: PaymentChannelType) => {
    switch (type) {
      case 'MTN_MOMO':
        return {
          icon: Smartphone,
          badgeBg: 'bg-yellow-400 text-slate-900',
          border: 'border-yellow-300 dark:border-yellow-700/60',
          label: 'MTN Mobile Money'
        };
      case 'ORANGE_MONEY':
        return {
          icon: Smartphone,
          badgeBg: 'bg-orange-500 text-white',
          border: 'border-orange-300 dark:border-orange-700/60',
          label: 'Orange Money Pro'
        };
      case 'BANQUE':
        return {
          icon: Landmark,
          badgeBg: 'bg-blue-600 text-white',
          border: 'border-blue-300 dark:border-blue-700/60',
          label: 'Compte Bancaire'
        };
      case 'ESPECES':
      default:
        return {
          icon: Banknote,
          badgeBg: 'bg-emerald-600 text-white',
          border: 'border-emerald-300 dark:border-emerald-700/60',
          label: 'Caisse Espèces'
        };
    }
  };

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    const acc = treasuryAccounts.find((a) => a.id === selectedAccountId) || treasuryAccounts[0];

    addTreasuryTransaction({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      accountId: acc.id,
      accountName: acc.name,
      channel: acc.type,
      type: txType,
      category,
      amount,
      description: description || `${txType === 'ENTREE' ? 'Entrée' : 'Sortie'} manuelle`,
      referenceNumber: refNumber,
      status: 'COMPLETE'
    });

    setDescription('');
    setAddTxOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Trésorerie & Réconciliation Bancaire
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des comptes MTN MoMo, Orange Money, Caisse espèces et Banques CEMAC.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              showToast('Rapprochement automatique MoMo / Orange Money synchronisé avec succès');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Synchroniser Relevés</span>
          </button>
          <button
            onClick={() => setAddTxOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Mouvement de Caisse / Banque</span>
          </button>
        </div>
      </div>

      {/* Total Consolidated Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
            Trésorerie Nette Disponible (Consolidée)
          </span>
          <div className="mt-2 text-3xl sm:text-4xl font-extrabold font-mono tracking-tight">
            {formatFCFA(totalConsolidated)}
          </div>
          <p className="mt-1 text-xs text-blue-200/80">
            Total en temps réel sur 4 canaux réconciliés à Douala & Yaoundé.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-xs font-mono">
          <div className="px-3 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
            <div className="text-blue-200 text-[10px]">Mobile Money</div>
            <div className="font-bold text-sm">
              {formatFCFA(treasuryAccounts[0].balance + treasuryAccounts[1].balance)}
            </div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
            <div className="text-blue-200 text-[10px]">Afriland Bank</div>
            <div className="font-bold text-sm">{formatFCFA(treasuryAccounts[3].balance)}</div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
            <div className="text-blue-200 text-[10px]">Caisse Espèces</div>
            <div className="font-bold text-sm">{formatFCFA(treasuryAccounts[2].balance)}</div>
          </div>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {treasuryAccounts.map((acc) => {
          const details = getChannelDetails(acc.type);
          const Icon = details.icon;
          return (
            <div
              key={acc.id}
              className={`p-5 rounded-xl border bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between ${details.border}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${details.badgeBg}`}>
                    {acc.type.replace('_', ' ')}
                  </span>
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {acc.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                    {acc.accountNumber}
                  </p>
                </div>

                <div className="mt-4 text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {formatFCFA(acc.balance)}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] flex justify-between font-mono">
                <span className="text-emerald-600">+{formatFCFA(acc.todayInflow)}</span>
                <span className="text-rose-500">-{formatFCFA(acc.todayOutflow)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 12-Month Treasury Cash Flow Evolution Chart */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              Évolution Trésorerie & Encaissements (12 Mois)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Historique des flux de trésorerie entrants par rapport aux décaissements d'exploitation.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Entrées
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" /> Sorties
            </span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[600px] h-48 flex items-end justify-between gap-2 pt-6 px-2">
            {[
              { m: 'Oct', in: 14.2, out: 11.5 },
              { m: 'Nov', in: 16.5, out: 12.0 },
              { m: 'Déc', in: 24.8, out: 18.2 },
              { m: 'Jan', in: 13.0, out: 10.4 },
              { m: 'Fév', in: 15.2, out: 11.8 },
              { m: 'Mar', in: 17.5, out: 13.1 },
              { m: 'Avr', in: 18.0, out: 14.0 },
              { m: 'Mai', in: 19.4, out: 14.5 },
              { m: 'Juin', in: 20.1, out: 15.2 },
              { m: 'Juil', in: 18.8, out: 14.8 },
              { m: 'Août', in: 19.5, out: 15.0 },
              { m: 'Sep', in: 21.4, out: 16.2 }
            ].map((col) => {
              const maxVal = 26;
              const inHeight = Math.round((col.in / maxVal) * 100);
              const outHeight = Math.round((col.out / maxVal) * 100);

              return (
                <div key={col.m} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {col.in}M
                  </div>
                  <div className="w-full flex items-end justify-center gap-1 h-32">
                    <div
                      style={{ height: `${inHeight}%` }}
                      className="w-full max-w-[14px] bg-blue-600 rounded-t-sm group-hover:bg-blue-500 transition-all"
                      title={`Entrées: ${col.in}M FCFA`}
                    />
                    <div
                      style={{ height: `${outHeight}%` }}
                      className="w-full max-w-[14px] bg-slate-200 dark:bg-slate-700 rounded-t-sm group-hover:bg-slate-300 dark:group-hover:bg-slate-600 transition-all"
                      title={`Sorties: ${col.out}M FCFA`}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {col.m}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AUDIT FRAUDE & ANOMALIES IA SECTION */}
      <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 backdrop-blur-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-600 text-white shadow-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-purple-950 dark:text-purple-200 font-display">
                  Audit Fraude & Détection d Anomalies IA
                </h3>
                <BadgeIA size="sm" label="Surveillance 24/7" />
              </div>
              <p className="text-xs text-slate-500">
                L algorithme analyse en continu les décaissements suspects, doublons et écarts de relevés.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
            {fraudAlerts.length} anomalie(s) active(s)
          </span>
        </div>

        {fraudAlerts.length > 0 ? (
          <div className="space-y-3">
            {fraudAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-purple-200/80 dark:border-purple-900/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                        alert.severity === 'HAUTE'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : alert.severity === 'MOYENNE'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      Gravité {alert.severity}
                    </span>
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      {alert.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">· {alert.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {alert.description}
                  </p>
                  <p className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">
                    ✦ Action corrective conseillée : {alert.suggestedFix}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => resolveFraudAlert(alert.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Régulariser</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Aucune anomalie de caisse détectée. Vos opérations sont 100% conformes.</span>
          </div>
        )}
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Flux de Trésorerie Récents
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            {treasuryTransactions.length} opérations enregistrées
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Date & Heure</th>
                <th className="py-3 px-4">Canal / Compte</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Réf. Transaction</th>
                <th className="py-3 px-4 text-right">Montant</th>
                <th className="py-3 px-4 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {treasuryTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Wallet className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-medium text-slate-600 dark:text-slate-300 text-sm">Aucun mouvement de trésorerie</p>
                    <p className="text-xs text-slate-400 mt-0.5">Enregistrez vos encaissements et décaissements Mobile Money, Caisse ou Banque</p>
                    <button
                      onClick={() => setAddTxOpen(true)}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nouvelle Transaction</span>
                    </button>
                  </td>
                </tr>
              ) : (
                treasuryTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    <div>{tx.date}</div>
                    <div className="text-[10px] text-slate-400">{tx.time}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {tx.accountName}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{tx.channel}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    <div className="font-medium">{tx.description}</div>
                    <div className="text-[10px] text-slate-400">{tx.category}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {tx.referenceNumber}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                    <span
                      className={
                        tx.type === 'ENTREE'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }
                    >
                      {tx.type === 'ENTREE' ? '+' : '-'} {formatFCFA(tx.amount)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                        tx.status === 'COMPLETE'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : tx.status === 'SUSPECT'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER: NEW TREASURY TRANSACTION */}
      <Drawer
        isOpen={isAddTxOpen}
        onClose={() => setAddTxOpen(false)}
        title="Enregistrer une Opération de Caisse / Trésorerie"
        subtitle="Entrée de fonds, virement de caisse ou décaissement certifié."
        footer={
          <>
            <button
              type="button"
              onClick={() => setAddTxOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Annuler
            </button>
            <button
              form="createTxForm"
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
            >
              Enregistrer l opération
            </button>
          </>
        }
      >
        <form id="createTxForm" onSubmit={handleCreateTx} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Sens de l opération
              </label>
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value as any)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
              >
                <option value="ENTREE">🟢 ENTRÉE (Encaissement)</option>
                <option value="SORTIE">🔴 SORTIE (Décaissement / Frais)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Compte concerné
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
              >
                {treasuryAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Montant (FCFA) *
            </label>
            <input
              type="number"
              min="100"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Catégorie
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Vente, Carburant, Loyer..."
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                N° Référence Transaction
              </label>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Description / Justificatif
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ex: Versement espèces vente journée Bonanjo"
              className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>
        </form>
      </Drawer>
    </div>
  );
};
