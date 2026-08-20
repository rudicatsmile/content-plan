-- Add 'planning' status to the submission_status ENUM
ALTER TYPE public.submission_status ADD VALUE IF NOT EXISTS 'planning' BEFORE 'draft';
