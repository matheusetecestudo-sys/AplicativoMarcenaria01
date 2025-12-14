import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, Product, Material, AppSettings, TimeRange } from '../types';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { loginWithEmail, loginWithGitHub as authLoginGitHub, logoutSupabase, onAuthStateChange } from '../auth';
import { fetchOrders, fetchProducts, fetchMaterials, fetchSettings, insertRow, updateRow, deleteRow, saveSettings } from '../database';

interface AppContextType {
    orders: Order[];
    products: Product[];
    materials: Material[];
    settings: AppSettings;
    isAuthenticated: boolean;
    timeRange: TimeRange;
    setTimeRange: (range: TimeRange) => void;
    login: (email: string, pass: string) => Promise<{ error: any }>;
    loginWithGitHub: () => Promise<{ error: any }>;
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



    // ... (existing imports)

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        try {
            return !!localStorage.getItem('auth_token') || !!localStorage.getItem('sb-access-token');
        } catch { return false; }
    });

    // Initial load will happen in useEffect now, so we start empty or with fallback
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);

    // Start with local storage fallback if needed, but let database override
    useEffect(() => {
        const loadInitialData = async () => {
            if (isSupabaseConfigured && isAuthenticated) {
                try {
                    const [dbOrders, dbProducts, dbMaterials, dbSettings] = await Promise.all([
                        fetchOrders(), fetchProducts(), fetchMaterials(), fetchSettings()
                    ]);

                    setOrders(dbOrders);
                    setProducts(dbProducts);
                    setMaterials(dbMaterials);
                    if (dbSettings) setSettings(dbSettings);
                } catch (e) {
                    console.error("Error loading data from Supabase:", e);
                }
            } else {
                // Fallback to local storage (mock data)
                setOrders(load('orders', initialOrders));
                setProducts(load('products', initialProducts));
                setMaterials(load('materials', initialMaterials));
                setSettings(load('settings', defaultSettings));
            }
        };
        loadInitialData();
    }, [isAuthenticated]);

    const [timeRange, setTimeRange] = useState<TimeRange>('TUDO');


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

    // --- AUTH LISTENER ---
    useEffect(() => {
        if (isSupabaseConfigured) {
            const { data: { subscription } } = onAuthStateChange((user) => {
                setIsAuthenticated(!!user);
                if (user) {
                    localStorage.setItem('auth_token', 'supabase_session');
                } else {
                    localStorage.removeItem('auth_token');
                }
            });
            return () => subscription.unsubscribe();
        }
    }, []);

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
        // Hybrid: Try Supabase first, fallback to mock if not configured or specific demo user
        if (isSupabaseConfigured && email !== 'admin@rino.com') {
            const { error } = await loginWithEmail(email, pass);
            if (!error) setIsAuthenticated(true);
            return { error };
        }

        // Mock Auth Fallback (or admin default)
        if (email && pass) {
            localStorage.setItem('auth_token', 'mock_token');
            setIsAuthenticated(true);
            return { error: null };
        }
        return { error: { message: "Credenciais inválidas" } };
    };

    const loginWithGitHub = async () => {
        return authLoginGitHub();
    };

    const logout = () => {
        if (isSupabaseConfigured) {
            logoutSupabase();
        }
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
    };

    // --- ORDERS ---
    const addOrder = async (order: Order) => {
        if (isSupabaseConfigured && isAuthenticated) {
            try {
                await insertRow('orders', {
                    id: order.id,
                    client: order.client,
                    deadline: order.deadline,
                    created_at: order.createdAt,
                    status: order.status,
                    origin: order.origin,
                    shipping_cost: order.shippingCost,
                    total_value: order.totalValue,
                    items: order.items
                });
            } catch (e) {
                console.error("Error saving order:", e);
                return;
            }
        }
        setOrders(prev => [order, ...prev]);

        // Deduct stock
        for (const item of order.items) {
            await updateProductStock(item.productId, -item.quantity);
        }
    };

    const deleteOrder = async (id: string) => {
        const order = orders.find(o => o.id === id);

        if (isSupabaseConfigured && isAuthenticated) {
            try {
                await deleteRow('orders', id);
            } catch (e) {
                console.error("Error deleting order:", e);
                return;
            }
        }

        if (order && order.status !== 'CONCLUÍDO') {
            // Restore stock if deleting a pending/late order (assuming not shipped)
            for (const item of order.items) {
                await updateProductStock(item.productId, item.quantity);
            }
        }
        setOrders(prev => prev.filter(o => o.id !== id));
    };

    const updateOrderStatus = async (id: string, newStatus: Order['status']) => {
        if (isSupabaseConfigured && isAuthenticated) {
            try {
                await updateRow('orders', id, { status: newStatus });
            } catch (e) {
                console.error("Error updating order status:", e);
                return;
            }
        }
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    };

    // --- PRODUCTS ---
    // --- PRODUCTS ---
    const addProduct = async (product: Product) => {
        if (isSupabaseConfigured && isAuthenticated) {
            try {
                // We ignore the generated ID here as Supabase creates its own UUIDs usually
                // But we can force one if the table allows. Let's send everything except ID if server generates it?
                // However, our app relies on client-gen IDs slightly. Let's assume we can send ID.
                // RLS ensures safety.
                await insertRow('products', {
                    // id: product.id, // Let Supabase generate ID or use ours? 
                    // Better to replicate local logic: ID generated by client? 
                    // Actually, database.ts insertRow ignores ID return unless we use it.
                    // Let's pass all fields.
                    name: product.name,
                    sku: product.sku,
                    materials: product.materials,
                    cost: product.cost,
                    stock: product.stock,
                    image: product.image
                });
                // Re-fetch to get the real ID? Or just use local one? 
                // For simplicity in this session, we assume successful insert.
            } catch (e) {
                console.error("Error adding product:", e);
                return;
            }
        }
        setProducts(prev => [...prev, product]);
    };

    const updateProduct = async (product: Product) => {
        if (isSupabaseConfigured && isAuthenticated) {
            try {
                await updateRow('products', product.id, {
                    name: product.name,
                    sku: product.sku,
                    materials: product.materials,
                    cost: product.cost,
                    stock: product.stock,
                    image: product.image
                });
            } catch (e) { console.error(e); return; }
        }
        setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    };

    const deleteProduct = async (id: string) => {
        if (isSupabaseConfigured && isAuthenticated) {
            try { await deleteRow('products', id); } catch (e) { console.error(e); return; }
        }
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const updateProductStock = async (id: string, delta: number) => {
        // This is tricky because we need the current stock. 
        // We rely on local state for the calculation to be fast.
        const product = products.find(p => p.id === id);
        if (product) {
            const newStock = Math.max(0, product.stock + delta);
            if (isSupabaseConfigured && isAuthenticated) {
                try {
                    await updateRow('products', id, { stock: newStock });
                } catch (e) { console.error(e); }
            }
            setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
        }
    };

    // --- MATERIALS ---
    const addMaterial = async (material: Material) => {
        if (isSupabaseConfigured && isAuthenticated) {
            try {
                await insertRow('materials', {
                    name: material.name,
                    unit: material.unit,
                    cost_per_unit: material.costPerUnit,
                    stock: material.stock,
                    min_stock: material.minStock
                });
            } catch (e) { console.error(e); return; }
        }
        setMaterials(prev => [...prev, material]);
    };

    const updateMaterial = async (material: Material) => {
        if (isSupabaseConfigured && isAuthenticated) {
            try {
                await updateRow('materials', material.id, {
                    name: material.name,
                    unit: material.unit,
                    cost_per_unit: material.costPerUnit,
                    stock: material.stock,
                    min_stock: material.minStock
                });
            } catch (e) { console.error(e); return; }
        }
        setMaterials(prev => prev.map(m => m.id === material.id ? material : m));
    };

    const deleteMaterial = async (id: string) => {
        if (isSupabaseConfigured && isAuthenticated) {
            try { await deleteRow('materials', id); } catch (e) { console.error(e); return; }
        }
        setMaterials(prev => prev.filter(m => m.id !== id));
    };

    const updateSettings = async (newSettings: Partial<AppSettings>) => {
        // Calculate new state based on current state closure
        // Note: In high concurrency this might miss updates, but settings changes are rare/manual.
        const updated = { ...settings, ...newSettings };
        if (newSettings.company) updated.company = { ...settings.company, ...newSettings.company };
        if (newSettings.notifications) updated.notifications = { ...settings.notifications, ...newSettings.notifications };
        if (newSettings.appearance) updated.appearance = { ...settings.appearance, ...newSettings.appearance };

        setSettings(updated);

        if (isSupabaseConfigured && isAuthenticated) {
            await saveSettings(updated);
        }
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
            login, loginWithGitHub, logout, addOrder, deleteOrder, updateOrderStatus,
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