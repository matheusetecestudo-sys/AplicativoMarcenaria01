-- Execute este script no SQL Editor do Supabase para corrigir os erros de "coluna não encontrada"

-- 1. Adicionar colunas novas na tabela de PRODUTOS
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS price numeric default 0,
ADD COLUMN IF NOT EXISTS labor_cost numeric default 0,
ADD COLUMN IF NOT EXISTS min_stock numeric default 5;

-- 2. Atualizar o cache do esquema (schema cache)
NOTIFY pgrst, 'reload config';
