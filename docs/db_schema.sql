-- Supabase Database Schema Setup for SCL Platform
-- Complete Canonical Schema Definition (R1)
-- Tables: profiles, match_messages, direct_messages, announcements, notifications, awards, verified_games, daily_friendlies

-- Enable pgcrypto extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. Profiles Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  name text NOT NULL,
  university text,
  faculty text,
  department text,
  level text,
  chess_username text,
  lichess_username text,
  chess_rating integer DEFAULT 0,
  lichess_rating integer DEFAULT 0,
  last_rating_sync timestamp with time zone,
  role text DEFAULT 'player',
  last_seen timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for profiles presence & activity tracking
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON public.profiles (last_seen);

-- RLS & Policies for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
CREATE POLICY "Users can update their own profiles" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);


-- =============================================================================
-- 2. Match Messages Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.match_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id text NOT NULL,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.match_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view match messages" ON public.match_messages;
CREATE POLICY "Anyone can view match messages" ON public.match_messages
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert match messages" ON public.match_messages;
CREATE POLICY "Authenticated users can insert match messages" ON public.match_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);


-- =============================================================================
-- 3. Direct Messages Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_direct_messages_read_at ON public.direct_messages (read_at);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_receiver ON public.direct_messages (sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver_read ON public.direct_messages (receiver_id, read_at);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON public.direct_messages (created_at DESC);

-- RLS & Policies for Direct Messages
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages sent to or by them" ON public.direct_messages;
CREATE POLICY "Users can view messages sent to or by them" ON public.direct_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send messages as sender" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can send messages as themselves" ON public.direct_messages;
CREATE POLICY "Users can send messages as sender" ON public.direct_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Receivers can update read status" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can update read status of messages received by them" ON public.direct_messages;
CREATE POLICY "Receivers can update read status" ON public.direct_messages
  FOR UPDATE USING (auth.uid() = receiver_id);


-- =============================================================================
-- 4. Announcements Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_global boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to sync author_id and created_by
CREATE OR REPLACE FUNCTION public.sync_announcement_author()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.author_id IS NULL AND NEW.created_by IS NOT NULL THEN
    NEW.author_id := NEW.created_by;
  ELSIF NEW.created_by IS NULL AND NEW.author_id IS NOT NULL THEN
    NEW.created_by := NEW.author_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_announcement_author ON public.announcements;
CREATE TRIGGER trg_sync_announcement_author
  BEFORE INSERT OR UPDATE ON public.announcements
  FOR EACH ROW EXECUTE PROCEDURE public.sync_announcement_author();

-- Indexes for Announcements
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_is_global ON public.announcements (is_global);
CREATE INDEX IF NOT EXISTS idx_announcements_author_id ON public.announcements (author_id);

-- RLS & Policies for Announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Announcements are viewable by everyone" ON public.announcements;
CREATE POLICY "Announcements are viewable by everyone" ON public.announcements
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can insert announcements" ON public.announcements;
CREATE POLICY "Only admins can insert announcements" ON public.announcements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can update announcements" ON public.announcements;
CREATE POLICY "Only admins can update announcements" ON public.announcements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can delete announcements" ON public.announcements;
CREATE POLICY "Only admins can delete announcements" ON public.announcements
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- =============================================================================
-- 5. Notifications Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications (user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications (created_at DESC);

-- RLS & Policies for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can select their own notifications" ON public.notifications;
CREATE POLICY "Users can select their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications read status" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can insert notifications (for system events)" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users or system can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users or system can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);


-- =============================================================================
-- 6. Awards Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.awards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  award_type text NOT NULL,
  tournament_id text NOT NULL,
  awarded_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, award_type, tournament_id)
);

ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Awards are viewable by everyone" ON public.awards;
CREATE POLICY "Awards are viewable by everyone" ON public.awards
  FOR SELECT USING (true);


-- =============================================================================
-- 7. Verified Games Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.verified_games (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id text NOT NULL UNIQUE,
  platform text NOT NULL,
  game_url text NOT NULL,
  winner_username text,
  is_admin_approved boolean DEFAULT false,
  extracted_stats jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.verified_games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Verified games are viewable by everyone" ON public.verified_games;
CREATE POLICY "Verified games are viewable by everyone" ON public.verified_games
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify verified games" ON public.verified_games;
CREATE POLICY "Only admins can modify verified games" ON public.verified_games
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- =============================================================================
-- 8. Daily Friendlies Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.daily_friendlies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_date DATE NOT NULL,
  player_username TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  performance INTEGER NOT NULL DEFAULT 0,
  is_winner BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.daily_friendlies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Daily friendlies are viewable by everyone" ON public.daily_friendlies;
CREATE POLICY "Daily friendlies are viewable by everyone" ON public.daily_friendlies
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify daily friendlies" ON public.daily_friendlies;
CREATE POLICY "Only admins can modify daily friendlies" ON public.daily_friendlies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- =============================================================================
-- 9. Realtime Publication Setup
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
