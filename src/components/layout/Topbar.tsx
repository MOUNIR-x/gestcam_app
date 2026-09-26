import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, Sparkles, Menu, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';

export const Topbar: React.FC = () => {
  const {
    currentUser,
    setCommandPaletteOpen,
    theme,
    toggleTheme,
    fraudAlerts,
    lowStockCount,
    navigate,
    setMobileMenuOpen
  } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  // Formatted date in French: e.g. "Vendredi 25 Septembre 2026"
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date('2026-09-25T09:32:00'));

  // Capitalize first letter of weekday
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const totalAlerts = (fraudAlerts?.length || 0) + (lowStockCount > 0 ? 1 : 0);

  return (
    <header className="h-16 shrink-0 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between z-20 sticky top-0 transition-colors">
      {/* Zone 1: Mobile Hamburger & Greeting */}
      <div className="flex items-center gap-3">
        {/* Hamburger trigger for mobile devices */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Ouvrir le menu"
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              Bonjour, {currentUser.name.split(' ')[0]} 👋
            </h1>
            <span className="hidden lg:inline-block text-slate-300 dark:text-slate-600">·</span>
            <span className="hidden lg:inline-block text-xs text-slate-500 dark:text-slate-400 capitalize">
              {capitalizedDate}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[150px] sm:max-w-none">
            {currentUser.companyName} · {currentUser.city}
          </p>
        </div>
      </div>

      {/* Zone 2: ⌘K Search trigger */}
      <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md mx-4 lg:mx-6">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-400 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
            <span className="truncate">Rechercher client, facture, article, stock...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Actions & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Mobile Search Button */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          aria-label="Rechercher"
          className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick AI button */}
        <button
          onClick={() => navigate('/ia')}
          style={{ backgroundColor: '#7C3AED' }}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Copilote IA</span>
          <span className="md:hidden">IA</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Notifications & Alertes
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {totalAlerts} active{totalAlerts > 1 ? 's' : ''}
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {lowStockCount > 0 && (
                  <div
                    onClick={() => {
                      navigate('/stocks');
                      setShowNotifications(false);
                    }}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex gap-2.5 transition-colors"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {lowStockCount} rupture(s) de stock imminente(s)
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Certains articles atteignent le seuil critique. Cliquez pour commander.
                      </p>
                    </div>
                  </div>
                )}

                {fraudAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      navigate('/tresorerie');
                      setShowNotifications(false);
                    }}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex gap-2.5 transition-colors"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {alert.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                ))}

                {totalAlerts === 0 && (
                  <div className="p-4 text-center text-slate-400">
                    <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                    <span>Toutes vos alertes sont à jour !</span>
                  </div>
                )}
              </div>

              <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setShowNotifications(false);
                  }}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Voir tout le journal d'activité
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar with Profile link */}
        <div
          onClick={() => navigate('/parametres')}
          className="flex items-center gap-2 pl-1 cursor-pointer group"
          title="Mon profil et paramètres"
        >
          <Avatar name={currentUser.name} size="md" />
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              {currentUser.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
