import { supabase } from './supabaseClient';
import { Order, Product, Material, AppSettings } from './types';
import { getCurrentUser } from './auth';

// --- GENERIC HELPERS ---

export const fetchTable = async <T>(table: string) => {
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (error) {
        console.error(`Error fetching ${table}:`, error);
        return [];
    }
    return data as T[];
};

export const insertRow = async <T>(table: string, row: any) => {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not valid");

    // Adiciona user_id automaticamente se não estiver presente
    const payload = { ...row, user_id: user.id };

    const { data, error } = await supabase.from(table).insert(payload).select().single();
    if (error) throw error;
    return data as T;
};

export const updateRow = async <T>(table: string, id: string, updates: any) => {
    const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as T;
};

export const deleteRow = async (table: string, id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
};

// --- SPECIFIC LOADERS (Com mapeamento se necessário) ---

export const fetchOrders = async (): Promise<Order[]> => {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    // Converter snake_case do DB para camelCase do App se precisar, 
    // mas vamos tentar manter compatibilidade direta.
    // O campo 'items' vem como JSON, o Supabase já converte para objeto JS automaticamente.
    return data.map((o: any) => ({
        ...o,
        shippingCost: o.shipping_cost,
        totalValue: o.total_value,
        createdAt: o.created_at
    })) as Order[];
};

export const fetchProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data as Product[];
};

export const fetchMaterials = async (): Promise<Material[]> => {
    const { data, error } = await supabase.from('materials').select('*');
    if (error) throw error;
    return data.map((m: any) => ({
        ...m,
        costPerUnit: m.cost_per_unit || m.costPerUnit,
        minStock: m.min_stock || m.minStock
    })) as Material[];
};

export const fetchSettings = async (): Promise<AppSettings | null> => {
    const { data, error } = await supabase.from('app_settings').select('*').single();
    if (error) return null; // Pode não existir config ainda

    if (data) {
        return {
            company: {
                name: data.company_name,
                slogan: data.company_slogan,
                cnpj: data.company_cnpj || '',
                contact: data.company_contact || '',
                logo: data.company_logo || ''
            },
            notifications: {
                lowStock: data.notif_low_stock,
                deadlines: data.notif_deadlines
            },
            appearance: {
                theme: data.theme as any,
                density: data.density as any,
                layoutMode: data.layout_mode as any
            }
        };
    }
    return null;
};

// --- SAVERS ---

export const saveSettings = async (settings: AppSettings) => {
    const user = await getCurrentUser();
    if (!user) return;

    const payload = {
        user_id: user.id,
        company_name: settings.company.name,
        company_slogan: settings.company.slogan,
        company_cnpj: settings.company.cnpj,
        company_contact: settings.company.contact,
        company_logo: settings.company.logo,
        notif_low_stock: settings.notifications.lowStock,
        notif_deadlines: settings.notifications.deadlines,
        theme: settings.appearance.theme,
        density: settings.appearance.density,
        layout_mode: settings.appearance.layoutMode,
        updated_at: new Date().toISOString()
    };

    // Upsert (Insert or Update)
    const { error } = await supabase.from('app_settings').upsert(payload);
    if (error) console.error('Error saving settings:', error);
};
