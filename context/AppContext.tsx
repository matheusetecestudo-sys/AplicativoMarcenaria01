import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, Product, Material, AppSettings, TimeRange } from '../types';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

interface AppContextType {
  orders: Order[];
  products: Product[];
  materials: Material[];
  settings: AppSettings;
  isAuthenticated: boolean;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  login: (email: string, pass: string) => Promise<{ error: any }>;
  logout: () => void;
  addOrder: (order: Order) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProductStock: (id: string, delta: number) => Promise<void>;
  addMaterial: (material: Material) => Promise<void>;
  updateMaterial: (material: Material) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  importData: (json: string) => boolean;
  exportData: () => void;
  resetApp: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultSettings: AppSettings = {
  company: {
    name: 'MARCENARIA BRUTAL',
    slogan: 'Painel de Controle',
    cnpj: '',
    contact: '',
    logo: ''
  },
  notifications: { lowStock: true, deadlines: true },
  appearance: { 
      theme: 'Escuro', 
      density: 'COMPACTO',
      layoutMode: 'FLUIDO' 
  }
};

// --- DATA HELPERS ---
const daysAgo = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
};

const futureDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
};

// --- MOCK INITIAL DATA ---
const initialMaterials: Material[] = [
  { id: '1', name: 'Madeira Maciça (M²)', unit: 'm²', costPerUnit: 150, stock: 50, minStock: 10 },
  { id: '2', name: 'Barra de Ferro (3m)', unit: 'un', costPerUnit: 45, stock: 30, minStock: 5 },
  { id: '3', name: 'Verniz Fosco (L)', unit: 'l', costPerUnit: 35, stock: 12, minStock: 4 },
  { id: '4', name: 'Cola p/ Madeira (kg)', unit: 'kg', costPerUnit: 22, stock: 3, minStock: 5 }, // Critical
  { id: '5', name: 'Lixa Grão 100', unit: 'un', costPerUnit: 2.50, stock: 100, minStock: 20 },
  { id: '6', name: 'Parafusos 50mm (cx)', unit: 'cx', costPerUnit: 15, stock: 8, minStock: 5 },
];

const initialProducts: Product[] = [
  { 
      id: '1', name: 'Cadeira Eames Wood', sku: 'CDR-EAM', 
      materials: ['Madeira: 1', 'Plastico: 1'], cost: 120, stock: 15, 
      image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80' 
  },
  { 
      id: '2', name: 'Mesa Industrial', sku: 'MSA-IND', 
      materials: ['Ferro: 4', 'Madeira Maciça: 2'], cost: 450, stock: 4, 
      image: 'https://images.unsplash.com/photo-1577140917170-285929db55cc?auto=format&fit=crop&w=600&q=80' 
  },
  { 
      id: '3', name: 'Banco de Jardim', sku: 'BNC-JRD', 
      materials: ['Madeira Maciça: 3', 'Verniz: 1'], cost: 200, stock: 2, 
      image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=600&q=80' 
  },
  { 
      id: '4', name: 'Estante Modular', sku: 'EST-MOD', 
      materials: ['Madeira Maciça: 5', 'Parafusos: 1'], cost: 600, stock: 8, 
      image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=600&q=80' 
  },
];

const initialOrders: Order[] = [
    {
        id: '#5023', client: 'Roberto Almeida', deadline: daysAgo(2), createdAt: daysAgo(5), status: 'CONCLUÍDO', origin: 'FISICO', shippingCost: 0, totalValue: 2400,
        items: [{ productId: '1', productName: 'Cadeira Eames Wood', quantity: 10, unitPrice: 240, total: 2400 }]
    },
    {
        id: '#5024', client: 'Ana Souza Design', deadline: daysAgo(1), createdAt: daysAgo(3), status: 'CONCLUÍDO', origin: 'ONLINE', shippingCost: 150, totalValue: 1050,
        items: [{ productId: '2', productName: 'Mesa Industrial', quantity: 1, unitPrice: 900, total: 900 }]
    },
    {
        id: '#5025', client: 'Café do Centro', deadline: futureDate(-1), createdAt: daysAgo(2), status: 'ATRASADO', origin: 'FISICO', shippingCost: 50, totalValue: 800,
        items: [{ productId: '3', productName: 'Banco de Jardim', quantity: 2, unitPrice: 400, total: 800 }]
    },
    {
        id: '#5026', client: 'Mariana Luz', deadline: futureDate(5), createdAt: daysAgo(0), status: 'PENDENTE', origin: 'ONLINE', shippingCost: 80, totalValue: 1440,
        items: [{ productId: '1', productName: 'Cadeira Eames Wood', quantity: 4, unitPrice: 240, total: 960 }, { productId: '4', productName: 'Estante Modular', quantity: 1, unitPrice: 400, total: 400 }]
    },
    {
        id: '#5027', client: 'Escritório Tech', deadline: futureDate(10), createdAt: daysAgo(0), status: 'PENDENTE', origin: 'ONLINE', shippingCost: 200, totalValue: 4500,
        items: [{ productId: '2', productName: 'Mesa Industrial', quantity: 5, unitPrice: 900, total: 4500 }]
    }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from localStorage or use defaults with Error Handling
  const load = <T,>(key: string, def: T): T => {
      try {
          const stored = localStorage.getItem(key);
          if (!stored) return def;
          
          const parsed = JSON.parse(stored);
          // Simple validation check: if we expect an array (e.g. orders) but got object/null
          if (Array.isArray(def) && !Array.isArray(parsed)) {
              console.warn(`Data corruption detected for ${key}. Resetting to defaults.`);
              return def;
          }
          return parsed;
      } catch (error) {
          console.error(`Error loading ${key} from localStorage:`, error);
          return def;
      }
  };

  const [orders, setOrders] = useState<Order[]>(() => load('orders', initialOrders));
  const [products, setProducts] = useState<Product[]>(() => load('products', initialProducts));
  const [materials, setMaterials] = useState<Material[]>(() => load('materials', initialMaterials));
  const [settings, setSettings] = useState<AppSettings>(() => load('settings', defaultSettings));
  
  const [timeRange, setTimeRange] = useState<TimeRange>('TUDO');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
      try {
          return !!localStorage.getItem('auth_token');
      } catch { return false; }
  });

  // Persistence Effect
  useEffect(() => {
      try {
          localStorage.setItem('orders', JSON.stringify(orders));
          localStorage.setItem('products', JSON.stringify(products));
          localStorage.setItem('materials', JSON.stringify(materials));
          localStorage.setItem('settings', JSON.stringify(settings));
      } catch (e) {
          console.error("Failed to save state to localStorage", e);
      }
  }, [orders, products, materials, settings]);

  // --- THEME & SETTINGS EFFECT ---
  useEffect(() => {
    if (settings.appearance.theme === 'Escuro') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (settings.appearance.density === 'COMPACTO') {
        document.documentElement.style.fontSize = '14px';
    } else {
        document.documentElement.style.fontSize = '16px';
    }
  }, [settings]);

  // --- AUTH ---
  const login = async (email: string, pass: string) => {
      // Mock Auth
      if (email && pass) {
          localStorage.setItem('auth_token', 'mock_token');
          setIsAuthenticated(true);
          return { error: null };
      }
      return { error: { message: "Credenciais inválidas" } };
  };

  const logout = () => {
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
  };

  // --- ORDERS ---
  const addOrder = async (order: Order) => {
    setOrders(prev => [order, ...prev]);
    // Deduct stock immediately for local version
    order.items.forEach(item => {
        updateProductStock(item.productId, -item.quantity);
    });
  };

  const deleteOrder = async (id: string) => {
      const order = orders.find(o => o.id === id);
      if (order && order.status !== 'CONCLUÍDO') {
          // Restore stock if deleting a pending/late order
          order.items.forEach(item => {
              updateProductStock(item.productId, item.quantity);
          });
      }
      setOrders(prev => prev.filter(o => o.id !== id));
  };

  const updateOrderStatus = async (id: string, newStatus: Order['status']) => {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  // --- PRODUCTS ---
  const addProduct = async (product: Product) => {
      setProducts(prev => [...prev, product]);
  };
  
  const updateProduct = async (product: Product) => {
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  };

  const deleteProduct = async (id: string) => {
      setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateProductStock = async (id: string, delta: number) => {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p));
  };

  // --- MATERIALS ---
  const addMaterial = async (material: Material) => {
      setMaterials(prev => [...prev, material]);
  };

  const updateMaterial = async (material: Material) => {
      setMaterials(prev => prev.map(m => m.id === material.id ? material : m));
  };

  const deleteMaterial = async (id: string) => {
      setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
      setSettings(prev => {
          const updated = { ...prev, ...newSettings };
          if (newSettings.company) updated.company = { ...prev.company, ...newSettings.company };
          if (newSettings.notifications) updated.notifications = { ...prev.notifications, ...newSettings.notifications };
          if (newSettings.appearance) updated.appearance = { ...prev.appearance, ...newSettings.appearance };
          return updated;
      });
  };

  const importData = (json: string): boolean => {
      try {
          const data = JSON.parse(json);
          if (data.orders) setOrders(data.orders);
          if (data.products) setProducts(data.products);
          if (data.materials) setMaterials(data.materials);
          if (data.settings) setSettings(data.settings);
          return true;
      } catch { return false; }
  };

  const exportData = () => {
      const data = { orders, products, materials, settings };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
  };

  const resetApp = () => {
     localStorage.clear();
     // Reload page to re-initialize with default mock data
     window.location.reload();
  };

  return (
    <AppContext.Provider value={{
      orders, products, materials, settings, isAuthenticated, timeRange, setTimeRange,
      login, logout, addOrder, deleteOrder, updateOrderStatus,
      addProduct, updateProduct, deleteProduct, updateProductStock,
      addMaterial, updateMaterial, deleteMaterial,
      updateSettings, importData, exportData, resetApp
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};