-- Create Enums
CREATE TYPE public.user_role AS ENUM ('super_admin', 'media_admin', 'lembaga_admin', 'pimpinan');
CREATE TYPE public.submission_status AS ENUM ('draft', 'pending_review', 'approved', 'approved_with_notes', 'rejected');

-- 1. Lembaga
CREATE TABLE public.lembaga (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role public.user_role NOT NULL DEFAULT 'lembaga_admin',
    lembaga_id UUID REFERENCES public.lembaga(id) ON DELETE SET NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Social Platforms
CREATE TABLE public.social_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    icon_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Content Submissions
CREATE TABLE public.content_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lembaga_id UUID NOT NULL REFERENCES public.lembaga(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(1000),
    image_url TEXT,
    upload_date DATE NOT NULL,
    status public.submission_status NOT NULL DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Content Submission Platforms
CREATE TABLE public.content_submission_platforms (
    submission_id UUID NOT NULL REFERENCES public.content_submissions(id) ON DELETE CASCADE,
    platform_id UUID NOT NULL REFERENCES public.social_platforms(id) ON DELETE CASCADE,
    PRIMARY KEY (submission_id, platform_id)
);

-- 6. Submission Reviews
CREATE TABLE public.submission_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.content_submissions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    decision public.submission_status NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.content_submissions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX idx_content_submissions_lembaga_id ON public.content_submissions(lembaga_id);
CREATE INDEX idx_content_submissions_status ON public.content_submissions(status);
CREATE INDEX idx_content_submissions_upload_date ON public.content_submissions(upload_date);
CREATE INDEX idx_notifications_recipient_id_is_read ON public.notifications(recipient_id, is_read);

-- Enable RLS
ALTER TABLE public.lembaga ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_submission_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Draft)
-- In a real scenario, this would check JWT claims or use a security definer function, 
-- but for MVP we assume `profiles` is used for RLS via joining if necessary, or just relying on auth.uid()

-- Profiles: Users can read their own profile. Super/Media admin can read all.
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Lembaga: Anyone authenticated can read
CREATE POLICY "Authenticated users can read lembaga" ON public.lembaga FOR SELECT TO authenticated USING (true);

-- Social Platforms: Anyone authenticated can read
CREATE POLICY "Authenticated users can read platforms" ON public.social_platforms FOR SELECT TO authenticated USING (true);

-- Submissions: 
-- lembaga_admin can read/write their own lembaga's submissions
-- media_admin & pimpinan can read all submissions
CREATE POLICY "Lembaga admin can manage their submissions" ON public.content_submissions 
FOR ALL TO authenticated 
USING (
  created_by = auth.uid() OR
  lembaga_id = (SELECT lembaga_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Media Admin and Pimpinan can view all submissions" ON public.content_submissions 
FOR SELECT TO authenticated 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('media_admin', 'pimpinan', 'super_admin')
);

-- Others will follow similar patterns.
