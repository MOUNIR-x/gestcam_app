import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, Package, Users, FileText, Sparkles, Building2, Wallet, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen, navigate, products, clients } = useApp();
  const [query, setQuery] = useState('');

  const pages = useMemo(() => [
    { name: 'Vue d ensemble (Dashboard)', path: '/dashboard', icon: Building2, category: 'Navigation' },
    { name: 'Catalogue & Produits', path: '/catalogue', icon: Package, category: 'Navigation' },
    { name: 'Gestion des Stocks & CMUP', path: '/stocks', icon: Package, category: 'Navigation' },
    { name: 'Ventes & Facturation OHADA', path: '/facturation', icon: FileText, category: 'Navigation' },
    { name: 'CRM & Portefeuille Clients', path: '/clients', icon: Users, category: 'Navigation' },
    { name: 'Fournisseurs & Commandes', path: '/fournisseurs', icon: Building2, category: 'Navigation' },
    { name: 'Trésorerie (MoMo, OM, Caisse, Banque)', path: '/tresorerie', icon: Wallet, category: 'Navigation' },
    { name: 'Employés & Bulletins CNPS/IRPP', path: '/employes', icon: Users, category: 'Navigation' },
    { name: 'Assistant Stratégique GestCam IA', path: '/ia', icon: Sparkles, category: 'Intelligence' },
    { name: 'Paramètres & Configuration Fiscale', path: '/parametres', icon: Settings, category: 'Configuration' }
  ], []);

  const filteredPages = useMemo(() => {
    if (!query.trim()) return pages;
    return pages.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  }, [pages, query]);

  const filteredProducts = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.reference.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 4);
  }, [products, query]);

  const filteredClients = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    return clients.filter(c =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.company.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 3);
  }, [clients, query]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      <div
        onClick={() => setCommandPaletteOpen(false)}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      <div className="relative mx-auto max-w-2xl transform overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all">
        {/* Search Input */}
        <div className="relative flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder="Rechercher une page, un produit, un client ou une action... (Échap pour fermer)"
            className="w-full bg-transparent px-3 py-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {/* Navigation group */}
          <div className="py-1">
            <p className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Modules & Vues
            </p>
            {filteredPages.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.path}
                  onClick={() => {
                    navigate(p.path);
                    setCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-lg group transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    <span>{p.name}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
                </button>
              );
            })}
          </div>

          {/* Products match */}
          {filteredProducts.length > 0 && (
            <div className="py-1">
              <p className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Produits en stock
              </p>
              {filteredProducts.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => {
                    navigate('/stocks');
                    setCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-lg text-left"
                >
                  <div>
                    <span className="font-medium text-slate-900 dark:text-white">{prod.name}</span>
                    <span className="ml-2 text-xs font-mono text-slate-400">({prod.reference})</span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
                    Stock: {prod.stockCurrent} {prod.unit}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Clients match */}
          {filteredClients.length > 0 && (
            <div className="py-1">
              <p className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Clients
              </p>
              {filteredClients.map((cli) => (
                <button
                  key={cli.id}
                  onClick={() => {
                    navigate('/clients');
                    setCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-lg text-left"
                >
                  <div>
                    <span className="font-medium text-slate-900 dark:text-white">{cli.company}</span>
                    <span className="ml-2 text-xs text-slate-400">· {cli.name}</span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {cli.city}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
