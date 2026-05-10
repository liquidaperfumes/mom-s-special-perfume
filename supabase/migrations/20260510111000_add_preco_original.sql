
-- Migração para adicionar a coluna precoOriginal na tabela produtos
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS "precoOriginal" numeric;
