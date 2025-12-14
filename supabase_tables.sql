-- TABELA DE PRODUTOS
create table public.products (
  id text primary key, -- ID texto para compatibilidade com app
  user_id uuid references auth.users not null,
  name text not null,
  sku text,
  materials text[], -- Array de strings simples
  cost numeric default 0,
  stock numeric default 0,
  image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABELA DE MATERIAIS
create table public.materials (
  id text primary key, -- ID texto para compatibilidade com app
  user_id uuid references auth.users not null,
  name text not null,
  unit text,
  cost_per_unit numeric default 0,
  stock numeric default 0,
  min_stock numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABELA DE PEDIDOS
create table public.orders (
  id text primary key, -- Mantendo ID texto como no app (#5023)
  user_id uuid references auth.users not null,
  client text not null,
  deadline timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  status text check (status in ('PENDENTE', 'ATRASADO', 'CONCLUÍDO', 'CANCELADO')),
  origin text check (origin in ('ONLINE', 'FISICO')),
  shipping_cost numeric default 0,
  total_value numeric default 0,
  items jsonb default '[]'::jsonb -- Itens do pedido salvos como JSON
);

-- TABELA DE CONFIGURAÇÕES (Perfil)
create table public.app_settings (
  user_id uuid references auth.users primary key,
  company_name text default 'MARCENARIA BRUTAL',
  company_slogan text default 'Painel de Controle',
  company_cnpj text,
  company_contact text,
  company_logo text,
  notif_low_stock boolean default true,
  notif_deadlines boolean default true,
  theme text default 'Escuro',
  density text default 'COMPACTO',
  layout_mode text default 'FLUIDO',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- POLÍTICAS DE SEGURANÇA (RLS)
-- Garante que cada usuário só veja seus próprios dados

-- Habilitar RLS
alter table public.products enable row level security;
alter table public.materials enable row level security;
alter table public.orders enable row level security;
alter table public.app_settings enable row level security;

-- Criar Políticas
create policy "Usuários podem ver seus próprios produtos" on products for select using (auth.uid() = user_id);
create policy "Usuários podem criar produtos" on products for insert with check (auth.uid() = user_id);
create policy "Usuários podem atualizar seus produtos" on products for update using (auth.uid() = user_id);
create policy "Usuários podem deletar seus produtos" on products for delete using (auth.uid() = user_id);

create policy "Usuários podem ver seus materiais" on materials for select using (auth.uid() = user_id);
create policy "Usuários podem criar materiais" on materials for insert with check (auth.uid() = user_id);
create policy "Usuários podem atualizar materiais" on materials for update using (auth.uid() = user_id);
create policy "Usuários podem deletar materiais" on materials for delete using (auth.uid() = user_id);

create policy "Usuários podem ver seus pedidos" on orders for select using (auth.uid() = user_id);
create policy "Usuários podem criar pedidos" on orders for insert with check (auth.uid() = user_id);
create policy "Usuários podem atualizar pedidos" on orders for update using (auth.uid() = user_id);
create policy "Usuários podem deletar pedidos" on orders for delete using (auth.uid() = user_id);

create policy "Usuários podem ver suas configurações" on app_settings for select using (auth.uid() = user_id);
create policy "Usuários podem criar configurações" on app_settings for insert with check (auth.uid() = user_id);
create policy "Usuários podem atualizar configurações" on app_settings for update using (auth.uid() = user_id);
