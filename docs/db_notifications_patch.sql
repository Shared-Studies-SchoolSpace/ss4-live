-- SCL Notification System Table & RLS Setup
-- Run this script in your Supabase SQL editor.

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. Create select and update policies
CREATE POLICY "Users can select their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications read status" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Enable service role insertion (Supabase dashboard / backend API bypasses RLS policies on INSERT by default)
-- No additional insert policy is needed as system scripts will insert rows on behalf of users, or we can add:
CREATE POLICY "Anyone can insert notifications (for system events)" ON public.notifications
  FOR INSERT WITH CHECK (true);
