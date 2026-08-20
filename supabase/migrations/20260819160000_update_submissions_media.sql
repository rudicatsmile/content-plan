-- Create content_types master table
CREATE TABLE public.content_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for content_types
ALTER TABLE public.content_types ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read content_types
CREATE POLICY "Authenticated users can read content_types" 
ON public.content_types FOR SELECT TO authenticated USING (true);

-- Insert Default Content Types
INSERT INTO public.content_types (name) VALUES 
('Kajian'),
('Berita'),
('Informasi'),
('Quotes'),
('Acara'),
('Lainnya');

-- Modify content_submissions
ALTER TABLE public.content_submissions 
ADD COLUMN content_type_id UUID REFERENCES public.content_types(id) ON DELETE SET NULL,
ADD COLUMN media_urls JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Migrate existing data from image_url to media_urls
UPDATE public.content_submissions
SET media_urls = jsonb_build_array(
    jsonb_build_object(
        'url', image_url,
        'type', 'image/jpeg',
        'name', 'image.jpg'
    )
)
WHERE image_url IS NOT NULL AND image_url != '';

-- Drop old column
ALTER TABLE public.content_submissions DROP COLUMN image_url;

-- Update Storage Bucket to allow Image, Video, and PDF, and increase file size limit to 100MB
UPDATE storage.buckets 
SET allowed_mime_types = '{image/*,video/*,application/pdf}',
    file_size_limit = 104857600
WHERE id = 'content-submissions';
