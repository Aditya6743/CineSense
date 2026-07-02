-- Create match_sessions table
CREATE TABLE IF NOT EXISTS public.match_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES auth.users(id) NOT NULL,
    vibe TEXT NOT NULL,
    language TEXT NOT NULL,
    movies JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create match_votes table
CREATE TABLE IF NOT EXISTS public.match_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.match_sessions(id) ON DELETE CASCADE NOT NULL,
    user_identifier TEXT NOT NULL,
    movie_title TEXT NOT NULL,
    vote BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.match_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_votes ENABLE ROW LEVEL SECURITY;

-- Policies for match_sessions
-- Creators can view and insert their own sessions
CREATE POLICY "Creators can insert their own sessions" ON public.match_sessions
    FOR INSERT WITH CHECK (auth.uid() = creator_id);
    
-- Anyone can view a session if they have the ID (used for link sharing)
CREATE POLICY "Anyone can view a session" ON public.match_sessions
    FOR SELECT USING (true);

-- Policies for match_votes
-- Anyone can insert a vote (guest user)
CREATE POLICY "Anyone can insert votes" ON public.match_votes
    FOR INSERT WITH CHECK (true);

-- Anyone can view votes for a session
CREATE POLICY "Anyone can view votes" ON public.match_votes
    FOR SELECT USING (true);
