/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CataloguePage } from './pages/CataloguePage';
import { StocksPage } from './pages/StocksPage';
import { FacturationPage } from './pages/FacturationPage';
import { ClientsPage } from './pages/ClientsPage';
import { FournisseursPage } from './pages/FournisseursPage';
import { TresoreriePage } from './pages/TresoreriePage';
import { EmployesPage } from './pages/EmployesPage';
import { IAPage } from './pages/IAPage';
import { ParametresPage } from './pages/ParametresPage';

const AppRouter: React.FC = () => {
  const { currentPath } = useApp();

  // Landing page route
  if (currentPath === '/') {
    return <LandingPage />;
  }

  // Auth routes
  if (currentPath === '/login') {
    return <AuthPage initialMode="login" />;
  }
  if (currentPath === '/register') {
    return <AuthPage initialMode="register" />;
  }

  // Dashboard authenticated routes wrapped in AppLayout
  const renderDashboardView = () => {
    switch (currentPath) {
      case '/dashboard':
        return <DashboardPage />;
      case '/catalogue':
        return <CataloguePage />;
      case '/stocks':
        return <StocksPage />;
      case '/facturation':
        return <FacturationPage />;
      case '/clients':
        return <ClientsPage />;
      case '/fournisseurs':
        return <FournisseursPage />;
      case '/tresorerie':
        return <TresoreriePage />;
      case '/employes':
        return <EmployesPage />;
      case '/ia':
        return <IAPage />;
      case '/parametres':
        return <ParametresPage />;
      default:
        return <DashboardPage />;
    }
  };

  return <AppLayout>{renderDashboardView()}</AppLayout>;
};

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
