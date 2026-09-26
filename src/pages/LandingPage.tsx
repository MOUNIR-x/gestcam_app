import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  Sparkles,
  Smartphone,
  Check,
  ChevronRight,
  Calculator,
  ArrowRight,
  TrendingUp,
  Boxes,
  FileCheck2,
  Building2,
  Lock,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatFCFA } from '../types';

export const LandingPage: React.FC = () => {
  const { navigate, theme, toggleTheme } = useApp();
  const [caMonthly, setCaMonthly] = useState<number>(15000000); // 15 M FCFA slider
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  // Estimated ROI calculation
  const timeSavedHours = Math.round(caMonthly / 500000);
  const moneySavedFCFA = Math.round(caMonthly * 0.035); // 3.5% saved on loss, fraud & stockout

  const pricingTiers = [
    {
      name: 'Démarrage Solo',
      target: 'Boutiques & Commerçants indépendants',
      price: 0,
      period: 'Gratuit à vie',
      description: 'Idéal pour démarrer la numérisation de vos ventes et de votre caisse.',
      features: [
        'Jusqu à 25 factures OHADA / mois',
        'Gestion de caisse espèces',
        'Catalogue jusqu à 50 produits',
        '1 compte utilisateur',
        'Calcul automatique des prix de vente'
      ],
      isPopular: false,
      ctaText: 'Commencer gratuitement',
      ctaAction: () => navigate('/register')
    },
    {
      name: 'Croissance PME',
      target: 'Pour PME en expansion (Douala / Yaoundé)',
      price: 5000,
      period: 'FCFA / mois',
      description: 'La solution complète pour sécuriser vos encaissements et piloter vos stocks.',
      features: [
        'Facturation OHADA illimitée (TVA & AIRS)',
        'Suivi des comptes MTN MoMo & Orange Money',
        'Calcul dynamique du CMUP en temps réel',
        'Alertes automatiques de rupture de stock',
        'Jusqu à 5 utilisateurs simultanés',
        'Transmission directe WhatsApp des devis/factures',
        'Exportation comptable certifiée'
      ],
      isPopular: true,
      ctaText: 'Essayer 14 jours sans engagement',
      ctaAction: () => navigate('/register')
    },
    {
      name: 'Entreprise Pro',
      target: 'Grandes structures & multi-magasins',
      price: 12000,
      period: 'FCFA / mois',
      description: 'Copilote IA stratégique, multi-dépôts et conformité fiscale avancée.',
      features: [
        'Tout ce qui est inclus dans Croissance',
        'Copilote IA GestCam illimité (✦ Claude Engine)',
        'Audit automatique anti-fraude & rapprochements',
        'Gestion de la paie OHADA (CNPS, IRPP, CAC)',
        'Utilisateurs et magasins illimités',
        'Gestion multi-devises (FCFA, EUR, USD)',
        'Support dédié WhatsApp 24/7'
      ],
      isPopular: false,
      ctaText: 'Rejoindre le club Pro',
      ctaAction: () => navigate('/register')
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white transition-colors">
      {/* Top Bar: 3 zones + Responsive Hamburger + Dark Mode Toggle */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 text-left focus:outline-hidden"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-xs">
                GC
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
                GestCam
              </span>
            </button>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-sm">
              OHADA
            </span>
          </div>

          {/* Zone 2: Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#fonctionnalites" className="hover:text-blue-600 dark:hover:text-white transition-colors">
              Fonctionnalités
            </a>
            <a href="#simulateur" className="hover:text-blue-600 dark:hover:text-white transition-colors">
              Simulateur ROI
            </a>
            <a href="#tarifs" className="hover:text-blue-600 dark:hover:text-white transition-colors">
              Tarifs FCFA
            </a>
            <a href="#ohada" className="hover:text-blue-600 dark:hover:text-white transition-colors">
              Conformité OHADA
            </a>
          </nav>

          {/* Zone 3: Actions + Dark Mode Switch + Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Basculer le thème"
              title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button
              onClick={() => navigate('/login')}
              className="hidden sm:inline-block px-3 sm:px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              Se connecter
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <span className="hidden sm:inline">Accéder au Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
              <span>→</span>
            </button>

            {/* Mobile Nav Toggle */}
            <button
              onClick={() => setMobileNavOpen(!isMobileNavOpen)}
              aria-label="Menu"
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav Menu */}
        {isMobileNavOpen && (
          <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
            <a
              href="#fonctionnalites"
              onClick={() => setMobileNavOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600"
            >
              Fonctionnalités
            </a>
            <a
              href="#simulateur"
              onClick={() => setMobileNavOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600"
            >
              Simulateur ROI
            </a>
            <a
              href="#tarifs"
              onClick={() => setMobileNavOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600"
            >
              Tarifs FCFA
            </a>
            <a
              href="#ohada"
              onClick={() => setMobileNavOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600"
            >
              Conformité OHADA
            </a>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  navigate('/login');
                }}
                className="w-1/2 py-2 text-center text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                Se connecter
              </button>
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  navigate('/register');
                }}
                className="w-1/2 py-2 text-center text-xs font-semibold text-white bg-blue-600 rounded-lg"
              >
                Créer un compte
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Conçu pour le marché camerounais · 100% Conforme OHADA</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white font-display text-balance">
              Le logiciel de gestion moderne que méritent les PME au Cameroun.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Facturation OHADA stricte, suivi du CMUP en temps réel, réconciliation MTN MoMo / Orange Money et copilote IA stratégique dans une interface ultra-rapide.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Démarrer l essai gratuit 14 jours</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-blue-600" />
                <span>Tester la démo immédiate</span>
              </button>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-500" /> Sans carte bancaire
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-500" /> Paiement par MoMo / OM
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-500" /> Support WhatsApp local
              </span>
            </div>
          </div>

          {/* Hero Dashboard Preview Window */}
          <div className="mt-10 sm:mt-14 max-w-5xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-mono text-slate-400 truncate max-w-[200px] sm:max-w-none">
                  gestcam.cm/dashboard · BatiCam Douala
                </span>
              </div>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 font-mono">
                Session Directe Active
              </span>
            </div>
            <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">Chiffre d affaires Mensuel</div>
                <div className="mt-2 text-xl sm:text-2xl font-bold font-mono-num text-slate-900 dark:text-white">
                  21 450 000 FCFA
                </div>
                <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold font-mono-num">
                  +18.4% vs mois dernier
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">Trésorerie Mobile Money & Banque</div>
                <div className="mt-2 text-xl sm:text-2xl font-bold font-mono-num text-slate-900 dark:text-white">
                  18 200 000 FCFA
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  MTN MoMo, OM & Afriland
                </div>
              </div>
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Audit Anti-Fraude & Rapprochement</span>
                </div>
                <div className="mt-2 text-sm font-semibold text-purple-900 dark:text-purple-200">
                  Écart de 12 500 FCFA détecté
                </div>
                <div className="mt-1 text-xs text-purple-700/80 dark:text-purple-400">
                  Vérification automatique en 0.2s
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="fonctionnalites" className="py-16 md:py-20 bg-slate-50/70 dark:bg-[#0E1526] border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Pensé pour les défis réels des gestionnaires au Cameroun
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Fini les cahiers de stock perdus, les calculs de TVA erronés et les détournements Mobile Money.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Factures Stricte Norme OHADA
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Calcul automatique de la TVA Cameroun à 19.25%, précompte AIRS à 2.2% ou 5.5%, mentions légales du NIU & RCCM et envoi instantané sur WhatsApp.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Boxes className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Valorisation CMUP en Temps Réel
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Recalcul dynamique du Coût Moyen Unitaire Pondéré après chaque livraison fournisseur. Alerte SMS et email dès qu un stock passe sous le seuil d alerte.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Trésorerie & Copilote Anti-Fraude IA
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Suivi multi-comptes MTN MoMo, Orange Money et banques locales (Afriland, SCB, BICEC). L IA audite les sorties de caisse et alerte en cas d anomalie.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simulator Section */}
      <section id="simulateur" className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="p-6 sm:p-10 rounded-3xl bg-slate-900 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-8">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Simulateur d Économies GestCam</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display">
                  Combien perdez-vous chaque mois sans gestion centralisée ?
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Déplacez le curseur selon le volume de ventes mensuelles de votre entreprise :
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
                  <span>Chiffre d affaires Mensuel Estimé</span>
                  <span className="font-mono text-base sm:text-xl text-blue-400 font-bold">
                    {formatFCFA(caMonthly)}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000000"
                  max="80000000"
                  step="1000000"
                  value={caMonthly}
                  onChange={(e) => setCaMonthly(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                  <span>2 000 000 FCFA</span>
                  <span>40 000 000 FCFA</span>
                  <span>80 000 000 FCFA</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-xs text-slate-400">Économies sur pertes & ruptures</div>
                  <div className="mt-1 text-2xl font-bold font-mono text-emerald-400">
                    +{formatFCFA(moneySavedFCFA)} / mois
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Grâce au calcul exact du CMUP et à l audit anti-fraude.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-xs text-slate-400">Temps administratif gagné</div>
                  <div className="mt-1 text-2xl font-bold font-mono text-blue-400">
                    ~{timeSavedHours} heures / mois
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Équivalent à plus d une semaine de travail réallouée à la vente.
                  </div>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>Sécuriser ma trésorerie avec GestCam</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section id="tarifs" className="py-16 md:py-20 bg-slate-50/70 dark:bg-[#0E1526] border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Des tarifs simples, transparents et sans engagement
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Règlement disponible directement par MTN Mobile Money ou Orange Money Cameroun.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col transition-all duration-200 bg-white dark:bg-slate-900 border ${
                  tier.isPopular
                    ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-xl'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {tier.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider rounded-full shadow-xs">
                    Le plus populaire au Cameroun
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {tier.target}
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black font-mono-num text-slate-900 dark:text-white">
                      {formatFCFA(tier.price).replace(' FCFA', '')}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">
                      {tier.price === 0 ? '' : 'FCFA'} {tier.period}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <div className="flex-1 space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {tier.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300">{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6">
                  <button
                    onClick={tier.ctaAction}
                    className={`w-full py-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      tier.isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                    }`}
                  >
                    {tier.ctaText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OHADA Compliance Banner */}
      <section id="ohada" className="py-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="p-6 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                Conformité Fiscale Légale au Cameroun (DGI & OHADA)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Toutes les factures générées respectent scrupuleusement le Code Général des Impôts (CGI Cameroun) et l Acte Uniforme OHADA : numérotation chronologique continue, séparation TVA 19.25% et retenue d acompte légal AIRS 2.2%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-10 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              GC
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white font-display">
              GestCam Cameroun
            </span>
            <span className="text-xs text-slate-400">
              · Douala & Yaoundé
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500 dark:text-slate-400">
            <button onClick={() => navigate('/login')} className="hover:text-blue-600">Connexion</button>
            <button onClick={() => navigate('/register')} className="hover:text-blue-600">Inscription</button>
            <button onClick={() => navigate('/dashboard')} className="hover:text-blue-600">Espace Démo</button>
            <a
              href="https://wa.me/237677418922"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              Contact WhatsApp (+237)
            </a>
          </div>

          <div className="text-xs text-slate-400">
            © 2026 GestCam Technologies. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};
