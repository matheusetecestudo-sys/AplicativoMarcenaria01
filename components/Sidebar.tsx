
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavItem: React.FC<{ to: string; icon: string; label: string; onClick: () => void }> = ({ to, icon, label, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-4 px-4 py-3 transition-all duration-300 relative group overflow-hidden ${isActive ? 'bg-primary text-white shadow-lg glow-blue' : 'hover:bg-primary/10 text-gray-500 dark:text-gray-400 hover:text-primary'}`
      }
    >
      <span className="material-symbols-outlined transition-transform duration-300 group-hover:scale-110">{icon}</span>
      <p className="text-xs font-black uppercase tracking-widest">{label}</p>
      <div className="absolute right-0 top-0 h-full w-1 bg-white opacity-0 group-active:opacity-100 transition-opacity"></div>
    </NavLink>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { settings, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Deseja realmente desconectar do sistema?")) {
      onClose();
      logout();
      navigate('/login');
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-md border-r-4 border-primary p-4 flex flex-col 
          z-50 transition-transform duration-300 ease-in-out glass
          lg:translate-x-0 lg:static lg:h-full lg:z-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="mb-8 flex justify-between items-center lg:items-start">
          <div className="flex items-center gap-3 overflow-hidden">
            {settings.company.logo ? (
              <div className="w-16 h-16 bg-white border-4 border-primary shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#FFF] p-1 flex items-center justify-center shrink-0">
                <img src={settings.company.logo} alt="Company Logo" className="max-w-full max-h-full object-contain" />
              </div>
            ) : null}

            <div className="flex flex-col overflow-hidden">
              <h1 className="text-black dark:text-white text-xl font-bold tracking-wider uppercase truncate" title={settings.company.name}>
                {settings.company.name || 'MARCENARIA'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-medium truncate" title={settings.company.slogan}>
                {settings.company.slogan || 'Painel de Controle'}
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button onClick={onClose} className="lg:hidden text-black dark:text-white hover:text-primary shrink-0 ml-2">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex flex-col gap-2 overflow-y-auto flex-1 custom-scrollbar">
          <NavItem to="/dashboard" icon="dashboard" label="Dashboard" onClick={onClose} />
          <NavItem to="/pedidos" icon="shopping_cart" label="Pedidos" onClick={onClose} />
          <NavItem to="/produtos" icon="inventory_2" label="Produtos" onClick={onClose} />
          <NavItem to="/materias" icon="forest" label="Matérias-Primas" onClick={onClose} />
          <NavItem to="/estoques" icon="warehouse" label="Estoques" onClick={onClose} />
          <NavItem to="/calculadora" icon="calculate" label="Calculadora" onClick={onClose} />
          <div className="border-t-2 border-gray-200 dark:border-gray-800 my-2"></div>
          <NavItem to="/configuracoes" icon="settings" label="Configurações" onClick={onClose} />
          <NavItem to="/ajuda" icon="help" label="Manual / Ajuda" onClick={onClose} />
        </nav>

        <div className="mt-auto pt-4 border-t-4 border-black dark:border-white">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors brutal-btn border-2 border-transparent hover:border-red-500"
          >
            <span className="material-symbols-outlined">logout</span>
            <p className="text-base font-bold uppercase">Sair</p>
          </button>
        </div>
      </aside>
    </>
  );
};
