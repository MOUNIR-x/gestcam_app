import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, Supplier, PurchaseOrder } from '../types';
import { Drawer } from '../components/ui/Drawer';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const FournisseursPage: React.FC = () => {
  const { suppliers, purchaseOrders, addSupplier, addPurchaseOrder } = useApp();
  const [activeTab, setActiveTab] = useState<'FOURNISSEURS' | 'COMMANDES'>('FOURNISSEURS');
  const [search, setSearch] = useState('');

  // New Supplier Drawer
  const [isNewSupplierOpen, setNewSupplierOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cimenterie & Liants');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('+237 2 33 ');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Douala');
  const [paymentTerms, setPaymentTerms] = useState('Comptant à la livraison');

  // New Purchase Order Drawer
  const [isNewPOOpen, setNewPOOpen] = useState(false);
  const [poSupplierId, setPoSupplierId] = useState(suppliers[0]?.id || '');
  const [poItemsCount, setPoItemsCount] = useState(200);
  const [poTotalAmount, setPoTotalAmount] = useState(950000);
  const [poDeliveryDate, setPoDeliveryDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addSupplier({
      name: name.trim(),
      category,
      contactName: contactName.trim() || 'Service Commercial',
      phone: phone.trim(),
      email: email.trim() || 'commandes@fournisseur.cm',
      city: city.trim(),
      paymentTerms
    });

    setName('');
    setContactName('');
    setNewSupplierOpen(false);
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === poSupplierId) || suppliers[0];

    addPurchaseOrder({
      supplierId: sup.id,
      supplierName: sup.name,
      date: new Date().toISOString().split('T')[0],
      deliveryDate: poDeliveryDate,
      itemsCount: poItemsCount,
      totalAmount: poTotalAmount,
      status: 'EN_COURS'
    });

    setNewPOOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Fournisseurs & Approvisionnements
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Relations grossistes, usines partenaires et bons de commande au Cameroun.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setNewPOOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Bon de Commande</span>
          </button>
          <button
            onClick={() => setNewSupplierOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <span>+ Fournisseur</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('FOURNISSEURS')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'FOURNISSEURS'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Fournisseurs Partenaires ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab('COMMANDES')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'COMMANDES'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Bons de Commande en Cours ({purchaseOrders.length})
        </button>
      </div>

      {/* SEARCH BAR */}
      {activeTab === 'FOURNISSEURS' && (
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher fournisseur, secteur..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
          />
        </div>
      )}

      {/* TAB 1: SUPPLIERS */}
      {activeTab === 'FOURNISSEURS' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Fournisseur / Usine</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Contact Commercial</th>
                  <th className="py-3 px-4">Conditions Règlement</th>
                  <th className="py-3 px-4 text-right">Volume Acheté</th>
                  <th className="py-3 px-4 text-right">Solde Dû</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Truck className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="font-medium text-slate-600 dark:text-slate-300 text-sm">Aucun fournisseur enregistré</p>
                      <p className="text-xs text-slate-400 mt-0.5">Ajoutez vos usines et grossistes pour gérer les approvisionnements</p>
                      <button
                        onClick={() => setNewSupplierOpen(true)}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Nouveau Fournisseur</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {s.city}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {s.category}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {s.contactName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{s.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      <span className="px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-[10px] font-medium">
                        {s.paymentTerms}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatFCFA(s.totalPurchased)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={s.balanceOwed > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                        {formatFCFA(s.balanceOwed)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setPoSupplierId(s.id);
                          setNewPOOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Commander
                      </button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PURCHASE ORDERS */}
      {activeTab === 'COMMANDES' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">N° Bon Commande</th>
                  <th className="py-3 px-4">Fournisseur</th>
                  <th className="py-3 px-4">Date Émission</th>
                  <th className="py-3 px-4">Date Prévue Livraison</th>
                  <th className="py-3 px-4 text-center">Unités</th>
                  <th className="py-3 px-4 text-right">Montant Total</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {po.orderNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {po.supplierName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{po.date}</td>
                    <td className="py-3 px-4 font-mono text-blue-600 dark:text-blue-400 font-semibold">
                      {po.deliveryDate}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">{po.itemsCount}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatFCFA(po.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                          po.status === 'LIVRE'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {po.status === 'LIVRE' ? 'Livré en magasin' : 'En cours livraison'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DRAWER: NEW PURCHASE ORDER */}
      <Drawer
        isOpen={isNewPOOpen}
        onClose={() => setNewPOOpen(false)}
        title="Nouveau Bon de Commande Fournisseur"
        subtitle="Engagement d'achat auprès des usines et grossistes camerounais."
        footer={
          <>
            <button
              type="button"
              onClick={() => setNewPOOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Annuler
            </button>
            <button
              form="createPOForm"
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
            >
              Émettre le Bon de Commande
            </button>
          </>
        }
      >
        <form id="createPOForm" onSubmit={handleCreatePO} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Fournisseur *
            </label>
            <select
              value={poSupplierId}
              onChange={(e) => setPoSupplierId(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Quantité d articles estimée
              </label>
              <input
                type="number"
                min="1"
                required
                value={poItemsCount}
                onChange={(e) => setPoItemsCount(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Date de livraison souhaitée
              </label>
              <input
                type="date"
                required
                value={poDeliveryDate}
                onChange={(e) => setPoDeliveryDate(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Montant total estimé HT (FCFA) *
            </label>
            <input
              type="number"
              min="1000"
              required
              value={poTotalAmount}
              onChange={(e) => setPoTotalAmount(Number(e.target.value))}
              className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-base font-bold text-blue-600"
            />
          </div>
        </form>
      </Drawer>

      {/* DRAWER: NEW SUPPLIER */}
      <Drawer
        isOpen={isNewSupplierOpen}
        onClose={() => setNewSupplierOpen(false)}
        title="Ajouter un Fournisseur Partenaire"
        subtitle="Référencez les usines, fabricants et importateurs réguliers."
        footer={
          <>
            <button
              type="button"
              onClick={() => setNewSupplierOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Annuler
            </button>
            <button
              form="createSupplierForm"
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
            >
              Enregistrer le fournisseur
            </button>
          </>
        }
      >
        <form id="createSupplierForm" onSubmit={handleCreateSupplier} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Raison Sociale Fournisseur *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Dangote Cement Cameroon SA"
              className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Secteur / Produits
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="ex: Cimenterie, Ferraillage..."
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Ville / Zone
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Douala (Bonabéri)"
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Contact Commercial
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Nom du commercial responsable"
              className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Téléphone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Conditions de paiement
              </label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="ex: 30 jours fin de mois"
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
