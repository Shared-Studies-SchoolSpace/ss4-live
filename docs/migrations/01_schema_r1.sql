-- Milestone 1 (R1): Database Schema Migration Script
-- Target Tables: profiles, direct_messages, announcements, notifications
-- Includes column additions, performance indexes, RLS security policies, and realtime replication.

-- -----------------------------------------------------------------------------
-- 1. Profiles Table Updates
-- -----------------------------------------------------------------------------
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

-- Ensure last_seen column exists on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen timestamp with time zone;

-- Index for profiles presence/last_seen queries
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON public.profiles (last_seen);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
CREATE POLICY "Users can update their own profiles" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 2. Direct Messages Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure read_at column exists
ALTER TABLE public.direct_messages ADD COLUMN IF NOT EXISTS read_at timestamp with time zone;

-- Performance Indexes for Direct Messages
CREATE INDEX IF NOT EXISTS idx_direct_messages_read_at ON public.direct_messages (read_at);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_receiver ON public.direct_messages (sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver_read ON public.direct_messages (receiver_id, read_at);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON public.direct_messages (created_at DESC);

-- Enable RLS for direct_messages
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Direct Messages RLS Policies
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

-- -----------------------------------------------------------------------------
-- 3. Announcements Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_global boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure author_id, created_by, and is_global columns exist
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS is_global boolean DEFAULT true NOT NULL;

-- Synchronize author_id and created_by for backward & forward compatibility
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

-- Performance Indexes for Announcements
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_is_global ON public.announcements (is_global);
CREATE INDEX IF NOT EXISTS idx_announcements_author_id ON public.announcements (author_id);

-- Enable RLS for announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Announcements RLS Policies
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

-- -----------------------------------------------------------------------------
-- 4. Notifications Table
-- -----------------------------------------------------------------------------
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

-- Ensure metadata column exists
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Performance Indexes for Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications (user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications (created_at DESC);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications RLS Policies
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

-- -----------------------------------------------------------------------------
-- 5. Realtime Publication Setup
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignore error if table is already in publication or user lacks superuser grant
  NULL;
END $$;
