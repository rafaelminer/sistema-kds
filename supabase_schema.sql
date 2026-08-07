-- ======================================================
-- SCRIPT DE BANCO DE DADOS SUPABASE PARA KDS MULTICANAL (GOOMER + IFOOD)
-- Execute este script no SQL Editor do seu projeto Supabase
-- ======================================================

-- 1. Criar a tabela de pedidos multicanal
CREATE TABLE IF NOT EXISTS public.pedidos (
    id TEXT PRIMARY KEY,
    goomer_id TEXT,
    ifood_id TEXT,
    channel TEXT DEFAULT 'GOOMER', -- 'GOOMER', 'IFOOD', 'BALCAO'
    order_type TEXT DEFAULT 'Delivery', -- 'Mesa', 'Delivery', 'Retirada'
    table_or_client TEXT NOT NULL,
    customer_name TEXT,
    sector TEXT DEFAULT 'Cozinha',
    status TEXT DEFAULT 'NOVO', -- 'NOVO', 'EM PREPARO', 'PRONTO', 'CONCLUIDO', 'CANCELADO'
    items JSONB DEFAULT '[]'::jsonb,
    total_price NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Se a tabela já existir, adicionar a coluna channel caso não exista:
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pedidos' AND column_name='channel') THEN
        ALTER TABLE public.pedidos ADD COLUMN channel TEXT DEFAULT 'GOOMER';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pedidos' AND column_name='ifood_id') THEN
        ALTER TABLE public.pedidos ADD COLUMN ifood_id TEXT;
    END IF;
END $$;

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura pública de pedidos KDS" ON public.pedidos;
DROP POLICY IF EXISTS "Permitir inserção de pedidos Webhook" ON public.pedidos;
DROP POLICY IF EXISTS "Permitir atualização de status" ON public.pedidos;
DROP POLICY IF EXISTS "Permitir deleção de pedidos" ON public.pedidos;

CREATE POLICY "Permitir leitura pública de pedidos KDS" ON public.pedidos FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de pedidos Webhook" ON public.pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de status" ON public.pedidos FOR UPDATE USING (true);
CREATE POLICY "Permitir deleção de pedidos" ON public.pedidos FOR DELETE USING (true);

-- 3. Habilitar Realtime WebSocket para notificação instantânea nas telas da cozinha
ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;
