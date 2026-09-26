import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, Product } from '../types';
import { Drawer } from '../components/ui/Drawer';
import {
  Search,
  Plus,
  Filter,
  Package,
  AlertTriangle,
  ArrowUpDown,
  Tag,
  Info
} from 'lucide-react';

export const CataloguePage: React.FC = () => {
  const { products, addProduct } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUTES');
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  // Form states for new product
  const [name, setName] = useState('');
  const [reference, setReference] = useState('');
  const [category, setCategory] = useState('Gros Œuvre');
  const [unit, setUnit] = useState('Pièce');
  const [purchasePrice, setPurchasePrice] = useState<number>(5000);
  const [sellingPrice, setSellingPrice] = useState<number>(6500);
  const [stockCurrent, setStockCurrent] = useState<number>(20);
  const [stockMin, setStockMin] = useState<number>(10);

  // Calculate live margin in form
  const dynamicMargin = sellingPrice > 0
    ? (((sellingPrice - purchasePrice) / sellingPrice) * 100).toFixed(1)
    : '0.0';

  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.category)));
    return ['TOUTES', ...list];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.reference.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        selectedCategory === 'TOUTES' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, search, selectedCategory]);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !reference) return;

    const marginPercent = Number(
      (((sellingPrice - purchasePrice) / sellingPrice) * 100).toFixed(2)
    );

    addProduct({
      reference: reference.toUpperCase().trim(),
      name: name.trim(),
      category,
      unit,
      purchasePrice,
      sellingPrice,
      cmup: purchasePrice, // Initial CMUP equals purchase price
      stockCurrent,
      stockMin,
      marginPercent
    });

    // Reset and close
    setName('');
    setReference('');
    setDrawerOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Catalogue & Tarifs Articles
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des prix de vente, Coût Moyen Unitaire Pondéré (CMUP) et marges brutes.
          </p>
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter un Produit</span>
        </button>
      </div>

      {/* Info notice about CMUP */}
      <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <span>
          <strong>Règle Comptable OHADA :</strong> Le <span className="font-semibold text-blue-700 dark:text-blue-300">CMUP (affiché en bleu)</span> est calculé automatiquement à chaque bon d entrée. Il protège votre rentabilité contre les fluctuations des cours des grossistes camerounais.
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par référence, désignation..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Réf. Article</th>
                <th className="py-3 px-4">Désignation</th>
                <th className="py-3 px-4">Famille</th>
                <th className="py-3 px-4 text-right">Dernier Achat HT</th>
                <th className="py-3 px-4 text-right">
                  <span className="text-blue-600 dark:text-blue-400">CMUP Actuel</span>
                </th>
                <th className="py-3 px-4 text-right">Prix Vente HT</th>
                <th className="py-3 px-4 text-right">Marge Brute</th>
                <th className="py-3 px-4 text-center">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-medium text-slate-600 dark:text-slate-300 text-sm">Catalogue vide</p>
                    <p className="text-xs text-slate-400 mt-0.5">Ajoutez vos premiers produits avec prix d'achat, prix de vente et seuils</p>
                    <button
                      onClick={() => setDrawerOpen(true)}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter un Article</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stockCurrent <= p.stockMin;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {p.reference}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-400">Unité : {p.unit}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {p.category}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatFCFA(p.purchasePrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#2563EB] dark:text-[#3B82F6] bg-blue-50/30 dark:bg-blue-950/20 whitespace-nowrap">
                      {formatFCFA(p.cmup)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatFCFA(p.sellingPrice)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-sm font-mono font-bold text-[11px] ${
                          p.marginPercent >= 20
                            ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300'
                            : p.marginPercent >= 12
                            ? 'text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300'
                            : 'text-rose-700 bg-rose-50 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {p.marginPercent}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className={`font-mono font-bold ${
                            isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {p.stockCurrent}
                        </span>
                        {isLow && (
                          <span title="Alerte stock bas">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer: Add Product */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Ajouter un Produit au Catalogue"
        subtitle="Définissez les prix d'achat, de vente et les seuils de réapprovisionnement."
        footer={
          <>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Annuler
            </button>
            <button
              form="addProductForm"
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
            >
              Enregistrer l article
            </button>
          </>
        }
      >
        <form id="addProductForm" onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Désignation du Produit / Article *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Ciment Dangote 42.5R - Sac 50kg"
              className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Référence / Code SKU *
              </label>
              <input
                type="text"
                required
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="ex: CIM-DANG-50"
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Famille / Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <option value="Gros Œuvre">Gros Œuvre</option>
                <option value="Ferraillage">Ferraillage</option>
                <option value="Toiture">Toiture</option>
                <option value="Finition & Peinture">Finition & Peinture</option>
                <option value="Électricité">Électricité</option>
                <option value="Revêtement">Revêtement</option>
                <option value="Plomberie">Plomberie</option>
                <option value="Outillage">Outillage</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Unité de conditionnement
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="ex: Sac 50kg, Carton, Pièce, Rouleau, Fût 20L"
              className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Prix d Achat HT (FCFA)
              </label>
              <input
                type="number"
                min="0"
                required
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Prix de Vente HT (FCFA)
              </label>
              <input
                type="number"
                min="0"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
          </div>

          {/* Dynamic Margin Indicator */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-500">Marge brute prévisionnelle :</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
              {dynamicMargin}% ({formatFCFA(sellingPrice - purchasePrice)})
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Stock Initial Présent
              </label>
              <input
                type="number"
                min="0"
                required
                value={stockCurrent}
                onChange={(e) => setStockCurrent(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Seuil d Alerte Minimum
              </label>
              <input
                type="number"
                min="1"
                required
                value={stockMin}
                onChange={(e) => setStockMin(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
