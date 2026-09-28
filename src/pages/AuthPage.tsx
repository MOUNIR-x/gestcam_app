import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check, ArrowRight, ArrowLeft, Building2, Store, Wrench, Utensils, HeartPulse, Wheat, Smartphone, ShieldCheck, Sun, Moon } from 'lucide-react';
import { BusinessType } from '../types';

export const AuthPage: React.FC<{ initialMode?: 'login' | 'register' }> = ({ initialMode = 'login' }) => {
  const { navigate, showToast, theme, toggleTheme, updateCompanySettings, updateCurrentUser } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Multi-step registration: 1/3, 2/3, 3/3
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: User & Contact
  const [fullName, setFullName] = useState('Mounir Kamdem');
  const [email, setEmail] = useState('mounir.kamdem@baticam-cm.com');
  const [phone, setPhone] = useState('+237 6 77 41 89 22');
  const [password, setPassword] = useState('••••••••');

  // Step 2: Business & OHADA Tax
  const [companyName, setCompanyName] = useState('BatiCam Distribution Sarl');
  const [city, setCity] = useState('Douala (Akwa)');
  const [businessType, setBusinessType] = useState<BusinessType>('COMMERCE_GENERAL');
  const [niu, setNiu] = useState('M052012485901T');
  const [rccm, setRccm] = useState('RC/DLA/2021/B/1429');
  const [regime, setRegime] = useState<'REEL' | 'SIMPLIFIE'>('REEL');

  // Step 3: Payment Channel
  const [paymentMethod, setPaymentMethod] = useState<'MTN_MOMO' | 'ORANGE_MONEY' | 'VIREMENT'>('MTN_MOMO');
  const [momoNumber, setMomoNumber] = useState('+237 6 77 41 89 22');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Erreur login' }));
          showToast(err.error || 'Échec de la connexion');
          return;
        }
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('gestcam_token', data.token);
        }
        if (data.user) updateCurrentUser(data.user);
        if (data.company) updateCompanySettings(data.company);
        showToast('Connexion réussie ! Bienvenue sur GestCam.');
        navigate('/dashboard');
      } catch (err: any) {
        showToast(err?.message || 'Erreur réseau');
      }
    })();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name: fullName,
      email: email,
      phone: phone,
      companyName: companyName,
      city: city
    });
    updateCompanySettings({
      name: companyName,
      commercialName: companyName.split(' ')[0] || companyName,
      niu: niu,
      rccm: rccm,
      city: city,
      phone: phone,
      email: email,
      regime: regime
    });
    showToast('Votre compte entreprise a été configuré avec succès !');
    navigate('/dashboard');
  };

  const businessTypesList: { id: BusinessType; label: string; icon: any; desc: string }[] = [
    { id: 'COMMERCE_GENERAL', label: 'Commerce Général & Quincaillerie', icon: Store, desc: 'Négoce, magasins de détail, quincaillerie' },
    { id: 'BTP_PRESTATIONS', label: 'BTP, Bâtiment & Prestations', icon: Wrench, desc: 'Chantiers, fournitures et services aux entreprises' },
    { id: 'RESTAURATION_HOTEL', label: 'Restauration & Hôtellerie', icon: Utensils, desc: 'Restaurants, snacks, hébergements touristiques' },
    { id: 'PHARMACIE_SANTE', label: 'Pharmacie, Santé & Parapharmacie', icon: HeartPulse, desc: 'Officines, cliniques, dépôts pharmaceutiques' },
    { id: 'AGRO_ALIMENTAIRE', label: 'Agro-alimentaire & Distribution', icon: Wheat, desc: 'Transformation locale, grossistes vivriers' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors relative">
      {/* Top action row */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label="Basculer le thème"
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Clair</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Sombre</span>
            </>
          )}
        </button>
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2.5 mx-auto mb-4 focus:outline-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-sm">
            GC
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            GestCam
          </span>
        </button>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
          {mode === 'login'
            ? 'Accédez à votre espace entreprise'
            : 'Création de compte entreprise PME'}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Plateforme conforme au droit comptable OHADA & téléprocédures Cameroun.
        </p>

        {/* Tab switch Login / Register */}
        <div className="mt-6 flex rounded-xl bg-slate-200/80 dark:bg-slate-800/80 p-1 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Créer un compte
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl border border-slate-200/80 dark:border-slate-800 sm:rounded-2xl sm:px-10">
          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email ou Numéro de Téléphone (+237)
                </label>
                <div className="mt-1.5">
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: contact@baticam-cm.com ou 677418922"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mot de passe
                  </label>
                  <a href="#reset" onClick={(e) => { e.preventDefault(); showToast('Lien de réinitialisation envoyé par SMS / Email'); }} className="text-xs text-blue-600 hover:underline">
                    Mot de passe oublié ?
                  </a>
                </div>
                <div className="mt-1.5">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all cursor-pointer"
                >
                  Accéder à GestCam →
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-500">
                  Besoin d une démo assistée ?{' '}
                  <a href="https://wa.me/237677418922" target="_blank" rel="noreferrer" className="text-emerald-600 font-semibold hover:underline">
                    Écrivez-nous sur WhatsApp
                  </a>
                </p>
              </div>
            </form>
          ) : (
            /* REGISTER MULTI-STEP FORM (1/3, 2/3, 3/3) */
            <form onSubmit={step === 3 ? handleRegisterSubmit : (e) => { e.preventDefault(); setStep((s) => (s < 3 ? s + 1 : s) as any); }}>
              {/* Stepper indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="text-blue-600 dark:text-blue-400">
                    Étape {step} sur 3 : {step === 1 ? 'Identité & Responsable' : step === 2 ? 'Entreprise & Fiscalité OHADA' : 'Canal de règlement'}
                  </span>
                  <span className="text-slate-400 font-mono">
                    {Math.round((step / 3) * 100)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </div>
              </div>

              {/* STEP 1: Personal info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Nom complet du Dirigeant / Gérant
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="ex: Mounir Kamdem"
                      className="mt-1 w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Email professionnel
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ex: contact@entreprise.cm"
                      className="mt-1 w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Téléphone mobile Cameroun (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+237 6 77 00 00 00"
                      className="mt-1 w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Mot de passe sécurisé
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Business & OHADA Tax Settings */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Secteur d activité principal
                    </label>
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      {businessTypesList.map((item) => {
                        const Icon = item.icon;
                        const isSelected = businessType === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => setBusinessType(item.id)}
                            className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-4 h-4 text-blue-600 shrink-0" />
                              <div>
                                <div className="text-xs font-bold">{item.label}</div>
                                <div className="text-[10px] text-slate-500">{item.desc}</div>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Nom de l Entreprise / Magasin
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Ville principale
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Douala, Yaoundé, etc."
                        className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        NIU (Identifiant Unique Cameroun)
                      </label>
                      <input
                        type="text"
                        value={niu}
                        onChange={(e) => setNiu(e.target.value)}
                        placeholder="M052012485901T"
                        className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Régime d imposition
                      </label>
                      <select
                        value={regime}
                        onChange={(e) => setRegime(e.target.value as any)}
                        className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg"
                      >
                        <option value="REEL">Régime du Réel (TVA 19.25% + Acompte 2.2%)</option>
                        <option value="SIMPLIFIE">Régime Simplifié (Acompte 5.5% / Pas de TVA)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Payment channel setup */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                    <span>
                      Essai gratuit complet de 14 jours. Aucun prélèvement automatique immédiat. Choisissez votre moyen d encaissement principal.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Canal de paiement privilégié
                    </label>
                    <div className="mt-2 space-y-2">
                      <label
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                          paymentMethod === 'MTN_MOMO'
                            ? 'border-yellow-500 bg-yellow-50/40 dark:bg-yellow-950/20'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'MTN_MOMO'}
                            onChange={() => setPaymentMethod('MTN_MOMO')}
                            className="accent-yellow-500"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">MTN Mobile Money Cameroun</div>
                            <div className="text-[10px] text-slate-500">Paiement instantané par prompt USSD *126#</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-yellow-400 text-slate-900">MoMo</span>
                      </label>

                      <label
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                          paymentMethod === 'ORANGE_MONEY'
                            ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'ORANGE_MONEY'}
                            onChange={() => setPaymentMethod('ORANGE_MONEY')}
                            className="accent-orange-500"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">Orange Money Pro</div>
                            <div className="text-[10px] text-slate-500">Validation via code secret #150#</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-orange-500 text-white">OM</span>
                      </label>

                      <label
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                          paymentMethod === 'VIREMENT'
                            ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'VIREMENT'}
                            onChange={() => setPaymentMethod('VIREMENT')}
                            className="accent-blue-500"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">Compte Bancaire CEMAC / Afriland / SCB</div>
                            <div className="text-[10px] text-slate-500">Règlement par virement interbancaire ou chèque</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-blue-600 text-white">Banque</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Numéro de notification MoMo / OM
                    </label>
                    <input
                      type="text"
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      className="mt-1 w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => (s - 1) as any)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Précédent</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <span>{step === 3 ? 'Finaliser et lancer GestCam' : 'Continuer vers étape ' + (step + 1)}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
