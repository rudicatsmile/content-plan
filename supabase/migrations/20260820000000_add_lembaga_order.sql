-- Add sort_order column to lembaga table
-- Using "sort_order" instead of "order" because "order" is a reserved SQL keyword
ALTER TABLE public.lembaga 
ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

-- Optional: You can set specific orders for existing data here if needed
-- UPDATE public.lembaga SET sort_order = 1 WHERE name = 'Biro A';
