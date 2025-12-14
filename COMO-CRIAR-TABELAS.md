# Configuração do Banco de Dados Supabase

Para que o aplicativo salve os dados na nuvem, você precisa criar as tabelas no Supabase.

## Passo 1: Acesse o Editor SQL
1. Vá para o Painel do Supabase do seu projeto: https://supabase.com/dashboard/project/bykrxtibtaqszogkfaqv/sql
2. Clique em **"New Query"** (Nova Consulta).

## Passo 2: Copiar e Colar
Copie todo o código abaixo e cole no editor SQL do Supabase:

```sql
-- TABELA DE PRODUTOS
create table public.products (
  id text primary key, -- ID texto
  user_id uuid references auth.users not null,
  name text not null,
  sku text,
  materials text[],
  cost numeric default 0,
  stock numeric default 0,
  image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABELA DE MATERIAIS
create table public.materials (
  id text primary key, -- ID texto
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
  id text primary key,
  user_id uuid references auth.users not null,
  client text not null,
  deadline timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  status text check (status in ('PENDENTE', 'ATRASADO', 'CONCLUÍDO', 'CANCELADO')),
  origin text check (origin in ('ONLINE', 'FISICO')),
  shipping_cost numeric default 0,
  total_value numeric default 0,
  items jsonb default '[]'::jsonb
);

-- TABELA DE CONFIGURAÇÕES
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

-- SEGURANÇA (RLS)
alter table public.products enable row level security;
alter table public.materials enable row level security;
alter table public.orders enable row level security;
alter table public.app_settings enable row level security;

create policy "Usuários podem gerenciar seus próprios produtos" on products for all using (auth.uid() = user_id);
create policy "Usuários podem gerenciar seus próprios materiais" on materials for all using (auth.uid() = user_id);
create policy "Usuários podem gerenciar seus próprios pedidos" on orders for all using (auth.uid() = user_id);
create policy "Usuários podem gerenciar suas próprias configurações" on app_settings for all using (auth.uid() = user_id);
```

## Passo 3: Executar
Clique no botão **"RUN"** (Executar) no canto inferior direito.

---
Após executar com sucesso (deve aparecer "Success" na parte inferior), me avise para eu atualizar o código do aplicativo!
