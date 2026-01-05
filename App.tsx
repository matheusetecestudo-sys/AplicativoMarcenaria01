

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { supabase } from './supabaseClient';
import { Sidebar } from './components/Sidebar';

// Lazy load all pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Orders = lazy(() => import('./pages/Orders').then(m => ({ default: m.Orders })));
const Products = lazy(() => import('./pages/Products').then(m => ({ default: m.Products })));
const Materials = lazy(() => import('./pages/Materials').then(m => ({ default: m.Materials })));
const Stock = lazy(() => import('./pages/Stock').then(m => ({ default: m.Stock })));
const Calculator = lazy(() => import('./pages/Calculator').then(m => ({ default: m.Calculator })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Help = lazy(() => import('./pages/Help').then(m => ({ default: m.Help })));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <div className="flex flex-col items-center gap-4">
      <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Carregando...</p>
    </div>
  </div>
);


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();
  const location = useLocation();

  // Special case: If we have a recovery hash, DO NOT redirect to login, let it fall through or handle it.
  // Actually, ProtectedRoute is for /dashboard etc. If we are in recovery, we shouldn't be here.
  // But if we ARE here with a hash, we should bounce to reset-password.
  if (location.hash.includes('type=recovery')) {
    return <Navigate to={`/reset-password${location.hash}`} replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { settings, isAuthenticated } = useApp();

  const isAuthPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/reset-password';

  // Force full width on Auth pages
  if (isAuthPage || !isAuthenticated) {
    return <>{children}</>;
  }

  // Determine Layout Width Class
  let containerClass = 'w-full';
  switch (settings.appearance.layoutMode) {
    case 'CINEMA':
      containerClass = 'max-w-[1600px] mx-auto border-x-4 border-black dark:border-white shadow-2xl';
      break;
    case 'FOCO':
      containerClass = 'max-w-[1024px] mx-auto border-x-4 border-black dark:border-white shadow-2xl';
      break;
    case 'FLUIDO':
    default:
      containerClass = 'w-full';
      break;
  }

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-black overflow-hidden relative transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full min-w-0 bg-background-light dark:bg-black relative transition-colors duration-300 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex-shrink-0 flex items-center justify-between p-4 border-b-4 border-primary bg-white dark:bg-[#1A1A1A] z-30">
          <h1 className="text-black dark:text-white text-xl font-bold uppercase tracking-wider">Marcenaria</h1>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-black dark:text-white p-1 hover:bg-primary/20 rounded"
          >
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>
        </header>

        {/* Main Content Area - Scrollable */}
        <main className={`flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 lg:p-8 animate-fade-in-up custom-scrollbar ${containerClass}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

const AuthListener: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // Proactive check removed to avoid race conditions with Router. 
    // SmartRedirect handles the initial hash navigation.
    // if (window.location.hash.includes('type=recovery')) { ... }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth Event:", event);
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/reset-password');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  return null;
};

const SmartRedirect: React.FC = () => {
  const location = useLocation();

  if (location.hash.includes('type=recovery')) {
    // CRITICAL: Must preserve the hash so Supabase can read the token on the destination page
    return <Navigate to={`/reset-password${location.hash}`} replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AuthListener />
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<SmartRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/pedidos" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/produtos" element={<ProtectedRoute><Products /></ProtectedRoute>} />
              <Route path="/materias" element={<ProtectedRoute><Materials /></ProtectedRoute>} />
              <Route path="/estoques" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
              <Route path="/calculadora" element={<ProtectedRoute><Calculator /></ProtectedRoute>} />
              <Route path="/configuracoes" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/ajuda" element={<ProtectedRoute><Help /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
