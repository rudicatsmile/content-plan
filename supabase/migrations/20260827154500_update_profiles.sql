-- Add phone_number and avatar_url to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for avatars bucket
-- 1. Public Read
CREATE POLICY "Avatars are publicly accessible." 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- 2. Authenticated Upload
CREATE POLICY "Authenticated users can upload avatars." 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'avatars');

-- 3. Authenticated Update
CREATE POLICY "Authenticated users can update avatars." 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'avatars');

-- 4. Authenticated Delete
CREATE POLICY "Authenticated users can delete avatars." 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'avatars');
