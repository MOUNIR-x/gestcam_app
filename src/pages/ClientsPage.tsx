import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, Client, ClientSegment } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { BadgeIA } from '../components/ui/BadgeIA';
import { Drawer } from '../components/ui/Drawer';
import { WhatsAppButton } from '../components/ui/WhatsAppButton';
import {
  Users2,
  Plus,
  Search,
  LayoutGrid,
  List,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const ClientsPage: React.FC = () => {
  const { clients, addClient } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<ClientSegment | 'TOUS'>('TOUS');

  // Drawer states
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<Client | null>(null);
  const [isNewClientOpen, setNewClientOpen] = useState(false);

  // New Client Form
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [niu, setNiu] = useState('');
  const [phone, setPhone] = useState('+237 6 ');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Douala');
  const [segment, setSegment] = useState<ClientSegment>('REGULIER');

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company.toLowerCase().includes(search.toLowerCase()) ||
        c.city.toLowerCase().includes(search.toLowerCase());
      const matchSeg = selectedSegment === 'TOUS' || c.segment === selectedSegment;
      return matchSearch && matchSeg;
    });
  }, [clients, search, selectedSegment]);

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !name) return;

    addClient({
      name: name.trim(),
      company: company.trim(),
      niu: niu.trim().toUpperCase() || undefined,
      email: email.trim() || 'contact@client.cm',
      phone: phone.trim(),
      city: city.trim(),
      segment,
      lastOrderDate: new Date().toISOString().split('T')[0],
      iaRecommendation: 'Nouveau client enregistré. Faire un premier appel de courtoisie dans 48h.'
    });

    setName('');
    setCompany('');
    setNiu('');
    setPhone('+237 6 ');
    setNewClientOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Portefeuille & CRM Clients
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Segmentation VIP, suivi des encours et recommandations intelligentes par client.
          </p>
        </div>

        <button
          onClick={() => setNewClientOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouveau Client</span>
        </button>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par raison sociale, nom, ville..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-slate-100 dark:bg-slate-800 text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-slate-100 dark:bg-slate-800 text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Segment Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {(['TOUS', 'VIP', 'REGULIER', 'PERDU'] as const).map((seg) => (
            <button
              key={seg}
              onClick={() => setSelectedSegment(seg)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedSegment === seg
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {seg === 'TOUS' ? 'Tous les clients' : seg === 'PERDU' ? 'En Risque / Perdu' : seg}
            </button>
          ))}
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        filteredClients.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <Users2 className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="font-medium text-slate-600 dark:text-slate-300 text-sm">Aucun client enregistré</p>
            <p className="text-xs text-slate-400 mt-0.5">Enregistrez vos entreprises clientes pour émettre des devis et factures</p>
            <button
              onClick={() => setNewClientOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau Client</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const hasOverdue = client.outstandingBalance > 0;
            return (
              <div
                key={client.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={client.company} size="lg" />
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                          {client.company}
                        </h3>
                        <p className="text-xs text-slate-500">{client.name}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                        client.segment === 'VIP'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : client.segment === 'PERDU'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {client.segment}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{client.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  </div>

                  {/* Financials */}
                  <div className="mt-4 grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Total Acheté
                      </span>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {formatFCFA(client.totalSpent)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Impayé en cours
                      </span>
                      <div
                        className={`font-mono font-bold ${
                          hasOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'
                        }`}
                      >
                        {formatFCFA(client.outstandingBalance)}
                      </div>
                    </div>
                  </div>

                  {/* IA Suggestion Preview */}
                  <div className="mt-3 p-2.5 rounded-lg bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-[11px] text-purple-900 dark:text-purple-300">
                    <span className="font-bold">✦ Suggestion IA : </span>
                    <span>{client.iaRecommendation}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedClientForDetails(client)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Fiche détaillée →
                  </button>

                  <WhatsAppButton
                    phone={client.phone}
                    size="sm"
                    label="WhatsApp"
                    message={`Bonjour ${client.name},\nNous vous remercions de votre collaboration avec ${client.company}.\nComment pouvons-nous vous accompagner sur vos prochains chantiers ?`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Client / Société</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Ville</th>
                  <th className="py-3 px-4">Segment</th>
                  <th className="py-3 px-4 text-right">Volume Acheté</th>
                  <th className="py-3 px-4 text-right">Encours / Impayé</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Users2 className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="font-medium text-slate-600 dark:text-slate-300 text-sm">Aucun client enregistré</p>
                      <p className="text-xs text-slate-400 mt-0.5">Enregistrez vos entreprises clientes pour émettre des devis et factures</p>
                      <button
                        onClick={() => setNewClientOpen(true)}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Nouveau Client</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {client.company}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        NIU: {client.niu || 'Non spécifié'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {client.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{client.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {client.city}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                          client.segment === 'VIP'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : client.segment === 'PERDU'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {client.segment}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatFCFA(client.totalSpent)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span
                        className={
                          client.outstandingBalance > 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600'
                        }
                      >
                        {formatFCFA(client.outstandingBalance)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedClientForDetails(client)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Consulter
                      </button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DRAWER: CLIENT DETAILS & IA ACTIONS */}
      {selectedClientForDetails && (
        <Drawer
          isOpen={true}
          onClose={() => setSelectedClientForDetails(null)}
          title={selectedClientForDetails.company}
          subtitle={`Fiche client détaillée · ${selectedClientForDetails.city}`}
          footer={
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                {selectedClientForDetails.invoicesCount} facture(s) archivée(s)
              </span>
              <WhatsAppButton
                phone={selectedClientForDetails.phone}
                label="Écrire sur WhatsApp"
                message={`Bonjour ${selectedClientForDetails.name}, nous faisons le point sur votre compte client GestCam.`}
              />
            </div>
          }
        >
          <div className="space-y-5">
            {/* Header Identity */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <Avatar name={selectedClientForDetails.company} size="xl" />
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {selectedClientForDetails.company}
                </h3>
                <p className="text-xs text-slate-500">Contact : {selectedClientForDetails.name}</p>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  NIU : {selectedClientForDetails.niu || 'Non enregistré'}
                </p>
              </div>
            </div>

            {/* Smart IA Recommendations Box */}
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 space-y-2">
              <div className="flex items-center gap-2">
                <BadgeIA label="Copilote GestCam IA" />
                <span className="text-xs font-bold text-purple-950 dark:text-purple-200">
                  Stratégie Recommandée
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedClientForDetails.iaRecommendation}
              </p>
            </div>

            {/* Balance Overview */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <span className="text-slate-400">Total Chiffre d Affaires</span>
                <div className="mt-1 text-base font-bold font-mono text-slate-900 dark:text-white">
                  {formatFCFA(selectedClientForDetails.totalSpent)}
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <span className="text-slate-400">Reste à Recouvrer</span>
                <div className="mt-1 text-base font-bold font-mono text-rose-600 dark:text-rose-400">
                  {formatFCFA(selectedClientForDetails.outstandingBalance)}
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <h4 className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Coordonnées
              </h4>
              <div className="flex justify-between">
                <span className="text-slate-500">Téléphone / WhatsApp :</span>
                <span className="font-mono font-semibold">{selectedClientForDetails.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email :</span>
                <span>{selectedClientForDetails.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Localisation géographique :</span>
                <span>{selectedClientForDetails.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dernière commande passée :</span>
                <span className="font-mono">{selectedClientForDetails.lastOrderDate}</span>
              </div>
            </div>
          </div>
        </Drawer>
      )}

      {/* DRAWER: NEW CLIENT */}
      <Drawer
        isOpen={isNewClientOpen}
        onClose={() => setNewClientOpen(false)}
        title="Ajouter un Nouveau Client"
        subtitle="Renseignez les données fiscales OHADA pour la facturation."
        footer={
          <>
            <button
              type="button"
              onClick={() => setNewClientOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Annuler
            </button>
            <button
              form="createClientForm"
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
            >
              Enregistrer le client
            </button>
          </>
        }
      >
        <form id="createClientForm" onSubmit={handleCreateClient} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Raison Sociale / Nom Entreprise *
            </label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="ex: Génie Civil & BTP Cameroun SA"
              className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nom du Contact / Responsable *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Ingénieur Patrick Eboa"
              className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                NIU (Identifiant Fiscal)
              </label>
              <input
                type="text"
                value={niu}
                onChange={(e) => setNiu(e.target.value)}
                placeholder="M010800029411P"
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Segment Client
              </label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value as any)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <option value="REGULIER">Régulier</option>
                <option value="VIP">VIP (Grand Compte)</option>
                <option value="PERDU">En Risque / Perdu</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Téléphone mobile (WhatsApp) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+237 6 77 00 00 00"
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Ville & Quartier
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Douala (Bonanjo)"
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@client.cm"
              className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>
        </form>
      </Drawer>
    </div>
  );
};
