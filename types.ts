
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  client: string;
  items: OrderItem[]; 
  deadline: string;
  createdAt: string; // Data de criação para filtros temporais
  status: 'PENDENTE' | 'ATRASADO' | 'CONCLUÍDO' | 'CANCELADO';
  origin: 'ONLINE' | 'FISICO';
  shippingCost: number; // Novo campo de frete
  totalValue: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  materials: string[];
  cost: number;
  stock: number;
  image: string;
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
  stock: number;
  minStock: number;
}

export interface AppSettings {
  company: {
    name: string;
    slogan: string;
    cnpj: string;
    contact: string;
    logo?: string;
  };
  notifications: {
    lowStock: boolean;
    deadlines: boolean;
  };
  appearance: {
    theme: 'Claro' | 'Escuro';
    density: 'RELAXADO' | 'PADRAO' | 'COMPACTO'; // Substitui compactMode
    layoutMode: 'FLUIDO' | 'CINEMA' | 'FOCO'; // Novos modos
  };
}

export type TimeRange = 'HOJE' | '7D' | 'MES' | 'ANO' | 'TUDO';

export enum Page {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  PEDIDOS = 'PEDIDOS',
  PRODUTOS = 'PRODUTOS',
  MATERIAS = 'MATERIAS',
  CALCULADORA = 'CALCULADORA',
  ESTOQUES = 'ESTOQUES',
  CONFIGURACOES = 'CONFIGURACOES',
  AJUDA = 'AJUDA'
}
