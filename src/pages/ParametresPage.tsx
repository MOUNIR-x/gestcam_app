import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA } from '../types';
import {
  Building2,
  FileCheck2,
  Bell,
  CreditCard,
  Check,
  Shield,
  Smartphone,
  Save
} from 'lucide-react';

export const ParametresPage: React.FC = () => {
  const { companySettings, updateCompanySettings, showToast } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'PROFIL' | 'OHADA' | 'ALERTES' | 'ABONNEMENT'>('PROFIL');

  // Form states
  const [name, setName] = useState(companySettings.name);
  const [commercialName, setCommercialName] = useState(companySettings.commercialName);
  const [niu, setNiu] = useState(companySettings.niu);
  const [rccm, setRccm] = useState(companySettings.rccm);
  const [cdi, setCdi] = useState(companySettings.cdi);
  const [address, setAddress] = useState(companySettings.address);
  const [city, setCity] = useState(companySettings.city);
  const [phone, setPhone] = useState(companySettings.phone);
  const [email, setEmail] = useState(companySettings.email);

  // OHADA tax config
  const [regime, setRegime] = useState(companySettings.regime);
  const [enableTva, setEnableTva] = useState(companySettings.enableTva);
  const [enableAcompte, setEnableAcompte] = useState(companySettings.enableAcompte);
  const [stockLowAlertThreshold, setStockLowAlertThreshold] = useState(companySettings.stockLowAlertThreshold);

  // Subscription state
  const [selectedPlan, setSelectedPlan] = useState<'CROISSANCE' | 'PRO'>('CROISSANCE');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings({
      name,
      commercialName,
      niu,
      rccm,
      cdi,
      address,
      city,
      phone,
      email
    });
  };

  const handleSaveOHADA = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings({
      regime,
      enableTva,
      enableAcompte,
      stockLowAlertThreshold
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
          Paramètres & Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Identifiants fiscaux camerounais, règles de calcul OHADA et alertes automatiques.
        </p>
      </div>

      {/* Internal Sub-Nav Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {[
          { id: 'PROFIL', label: '1. Profil Entreprise', icon: Building2 },
          { id: 'OHADA', label: '2. Configuration Fiscale OHADA', icon: FileCheck2 },
          { id: 'ALERTES', label: '3. Alertes & Notifications', icon: Bell },
          { id: 'ABONNEMENT', label: '4. Abonnement GestCam', icon: CreditCard }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: PROFIL ENTREPRISE */}
      {activeSubTab === 'PROFIL' && (
        <form onSubmit={handleSaveProfile} className="max-w-3xl space-y-5 bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Raison Sociale (Officielle) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nom Commercial d Enseigne
              </label>
              <input
                type="text"
                value={commercialName}
                onChange={(e) => setCommercialName(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                NIU - Numéro d Identifiant Unique (Cameroun) *
              </label>
              <input
                type="text"
                required
                value={niu}
                onChange={(e) => setNiu(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                RCCM - Registre du Commerce
              </label>
              <input
                type="text"
                value={rccm}
                onChange={(e) => setRccm(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Centre des Impôts de Rattachement (CDI / CIME)
            </label>
            <input
              type="text"
              value={cdi}
              onChange={(e) => setCdi(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Adresse Physique Siège
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Ville & Région
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Téléphone Standard
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email de Facturation
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Enregistrer les coordonnées</span>
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 2: CONFIGURATION FISCALE OHADA */}
      {activeSubTab === 'OHADA' && (
        <form onSubmit={handleSaveOHADA} className="max-w-3xl space-y-5 bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Régime d Imposition Fiscal (Loi de Finances Cameroun)
              </label>
              <select
                value={regime}
                onChange={(e) => setRegime(e.target.value as any)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold"
              >
                <option value="REEL">Régime du Réel (Assujetti TVA 19.25% + Acompte 2.2%)</option>
                <option value="SIMPLIFIE">Régime Simplifié (Non assujetti TVA + Acompte 5.5%)</option>
              </select>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Taxes Applicables sur les Factures de Vente
              </h4>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableTva}
                  onChange={(e) => setEnableTva(e.target.checked)}
                  className="mt-0.5 accent-blue-600"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Activer la TVA à 19.25%
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Décomposition légale : Taux de base 17.5% + 10% de Centimes Additionnels Communaux (CAC).
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-100 dark:border-slate-800">
                <input
                  type="checkbox"
                  checked={enableAcompte}
                  onChange={(e) => setEnableAcompte(e.target.checked)}
                  className="mt-0.5 accent-amber-500"
                />
                <div>
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    Activer l Acompte AIRS à 2.2% (Précompte sur factures personnes morales)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Déduction automatique au bas de la facture pour afficher le montant net à décaisser.
                  </div>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Seuil de déclenchement d alerte de stock par défaut (Unités)
              </label>
              <input
                type="number"
                min="1"
                value={stockLowAlertThreshold}
                onChange={(e) => setStockLowAlertThreshold(Number(e.target.value))}
                className="mt-1 w-full max-w-xs px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Valider les règles fiscales</span>
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 3: ALERTES & NOTIFICATIONS */}
      {activeSubTab === 'ALERTES' && (
        <div className="max-w-3xl space-y-4 bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Canaux d alertes & Déclencheurs automatiques
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  Alerte Rupture de Stock par WhatsApp
                </div>
                <div className="text-slate-500 text-[11px]">
                  Notification immédiate au gérant dès qu un article franchit son seuil critique.
                </div>
              </div>
              <input type="checkbox" defaultChecked className="accent-blue-600 w-4 h-4 cursor-pointer" />
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  Rappel automatique des factures à échéance (+15 jours)
                </div>
                <div className="text-slate-500 text-[11px]">
                  Préparation du message WhatsApp type pour le client avec le lien de paiement MoMo.
                </div>
              </div>
              <input type="checkbox" defaultChecked className="accent-blue-600 w-4 h-4 cursor-pointer" />
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  Alerte Fraude & Décaissement Suspect
                </div>
                <div className="text-slate-500 text-[11px]">
                  Notification si une sortie d espèces de plus de 50 000 FCFA a lieu hors heures ouvrées.
                </div>
              </div>
              <input type="checkbox" defaultChecked className="accent-purple-600 w-4 h-4 cursor-pointer" />
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: ABONNEMENT GESTCAM */}
      {activeSubTab === 'ABONNEMENT' && (
        <div className="max-w-4xl space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-sm">
                Forfait Actuel Actif
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                GestCam Croissance PME
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                5 000 FCFA / mois · Prochaine échéance le 15 Octobre 2026.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-emerald-600">
                Paiement automatique MoMo actif
              </span>
              <button
                onClick={() => showToast('Votre forfait est à jour. Aucun paiement immédiat requis.')}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
              >
                Gérer l Abonnement
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Changer de forfait
              </h4>
              <p className="text-xs text-slate-500">
                Passez à <strong>Entreprise Pro (12 000 FCFA / mois)</strong> pour débloquer les alertes multi-dépôts et le moteur IA sans limite.
              </p>
              <button
                onClick={() => showToast('Mise à niveau vers Entreprise Pro confirmée')}
                className="mt-2 w-full py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs cursor-pointer"
              >
                Passer à Entreprise Pro (12 000 FCFA) →
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Factures d abonnement GestCam
              </h4>
              <p className="text-xs text-slate-500">
                Téléchargez les quittances officielles pour votre déductibilité fiscale au Cameroun.
              </p>
              <button
                onClick={() => showToast('Téléchargement des quittances fiscales GestCam')}
                className="mt-2 w-full py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Télécharger le relevé annuel (PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
