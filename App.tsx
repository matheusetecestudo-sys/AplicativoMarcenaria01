
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { supabase } from './supabaseClient';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { Products } from './pages/Products';
import { Materials } from './pages/Materials';
import { Stock } from './pages/Stock';
import { Calculator } from './pages/Calculator';
import { Login } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { settings, isAuthenticated } = useApp();

  const isLoginPage = location.pathname === '/' || location.pathname === '/login';

  // Force full width on Login page
  if (isLoginPage || !isAuthenticated) {
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
        <main className={`flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 animate-fade-in-up custom-scrollbar ${containerClass}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

const AuthListener: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/reset-password');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  return null;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AuthListener />
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
