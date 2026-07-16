-- SCL Messaging System Schema Patch
-- Run this in your Supabase SQL Editor to enable user presence tracking and read receipts.

-- 1. Add last_seen column to profiles table to track "Last Seen" presence timestamps
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_seen timestamp with time zone;

-- 2. Add read_at column to direct_messages table to support "Read Receipts"
ALTER TABLE public.direct_messages
ADD COLUMN IF NOT EXISTS read_at timestamp with time zone;

-- 3. Add Update Policy to direct_messages so receivers can mark messages as read
CREATE POLICY "Users can update read status of messages received by them" ON public.direct_messages
  FOR UPDATE USING (auth.uid() = receiver_id);
