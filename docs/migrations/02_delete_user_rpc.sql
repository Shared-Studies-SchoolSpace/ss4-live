-- Migration 02: User Account Deletion and Profile Policy
-- Allows authenticated users to delete their own account and profiles.

-- 1. Create a SECURITY DEFINER function to delete the authenticated user from auth.users.
-- Since public.profiles has id referencing auth.users ON DELETE CASCADE, this will automatically delete the user's profile.
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- 2. Ensure users can delete their own profile row directly if required
DROP POLICY IF EXISTS "Users can delete their own profiles" ON public.profiles;
CREATE POLICY "Users can delete their own profiles" ON public.profiles
  FOR DELETE USING (auth.uid() = id);
