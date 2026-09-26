import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  PackageSearch,
  FileCheck2,
  Users2,
  Truck,
  Landmark,
  BadgeDollarSign,
  Sparkles,
  Settings,
  AlertTriangle,
  ArrowUpRight,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { currentPath, navigate, lowStockCount, companySettings, isMobileMenuOpen, setMobileMenuOpen } = useApp();

  const navItems = [
    { label: "Vue d'ensemble", path: '/dashboard', icon: LayoutDashboard },
    { label: 'Catalogue', path: '/catalogue', icon: Boxes },
    {
      label: 'Stocks',
      path: '/stocks',
      icon: PackageSearch,
      badge: lowStockCount > 0 ? `${lowStockCount} alerte${lowStockCount > 1 ? 's' : ''}` : undefined,
      badgeColor: 'bg-rose-500 text-white'
    },
    { label: 'Ventes & Facturation', path: '/facturation', icon: FileCheck2 },
    { label: 'CRM Clients', path: '/clients', icon: Users2 },
    { label: 'Fournisseurs', path: '/fournisseurs', icon: Truck },
    { label: 'Trésorerie', path: '/tresorerie', icon: Landmark },
    { label: 'Paie & RH', path: '/employes', icon: BadgeDollarSign },
    {
      label: 'Assistant IA',
      path: '/ia',
      icon: Sparkles,
      isSpecial: true
    },
    { label: 'Paramètres', path: '/parametres', icon: Settings }
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <button
          onClick={() => handleNavClick('/dashboard')}
          className="flex items-center gap-2.5 text-left group focus:outline-hidden"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-xs">
            GC
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white font-display">
                GestCam
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-sm">
                OHADA
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[130px]">
              {companySettings.city} · PME Pro
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handleNavClick('/')}
            title="Voir la Landing Page vitrine"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Fermer le menu"
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
          Gestion Commerciale
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`w-full flex items-center justify-between px-3 py-2.5 md:py-2 text-xs font-medium rounded-md transition-all duration-150 text-left ${
                isActive
                  ? 'border-l-[3px] border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] font-semibold dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-500 rounded-l-none'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-[#2563EB] dark:text-blue-400'
                      : item.isSpecial
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.isSpecial && (
                  <span
                    style={{ backgroundColor: '#7C3AED' }}
                    className="px-1.5 py-0.5 text-[9px] font-bold text-white rounded-sm leading-none"
                  >
                    ✦ IA
                  </span>
                )}

                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-sm leading-none bg-rose-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Stock Low Alert Summary Box if active */}
      {lowStockCount > 0 && (
        <div className="mx-3 mb-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{lowStockCount} rupture(s) imminente(s)</span>
          </div>
          <p className="mt-1 text-[11px] text-rose-600/90 dark:text-rose-300">
            Ciment Dangote, Peinture & Disques Bosch sous le seuil.
          </p>
          <button
            onClick={() => handleNavClick('/stocks')}
            className="mt-2 w-full py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 hover:underline text-left cursor-pointer"
          >
            Lancer réapprovisionnement →
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/80">
          <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
            {companySettings.commercialName}
          </div>
          <div className="mt-0.5 flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
            <span>NIU: {companySettings.niu.slice(0, 8)}...</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">OHADA</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (md and up) */}
      <aside className="hidden md:flex w-64 shrink-0 h-screen bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 flex-col z-30 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (small screens) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Drawer panel */}
          <div className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
