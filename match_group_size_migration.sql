-- Add target_votes column to match_sessions to allow dynamic group sizes
ALTER TABLE public.match_sessions ADD COLUMN IF NOT EXISTS target_votes INT NOT NULL DEFAULT 2;
