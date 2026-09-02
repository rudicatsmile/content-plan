CREATE TYPE public.publish_permission_status AS ENUM ('menunggu', 'diizinkan', 'ditolak');

ALTER TABLE public.content_submissions
ADD COLUMN publish_permission public.publish_permission_status NOT NULL DEFAULT 'menunggu';

CREATE INDEX idx_content_submissions_publish_permission ON public.content_submissions(publish_permission);
