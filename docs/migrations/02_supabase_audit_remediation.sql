-- =============================================================================
-- SS4 / SCL Platform: Supabase Audit Remediation Script (Milestone R2)
-- Execute this script in the Supabase SQL Editor.
-- Fixes:
--   1. Missing RLS policies on profiles (INSERT for signup, UPDATE for admin approvals)
--   2. Missing profile columns (phone, whatsapp, approval_status)
--   3. Missing RLS policies on verified_games & awards
--   4. Realtime publication inclusion for match_messages
--   5. Automated auth trigger to self-heal missing profile rows on signup
--   6. Atomic stored procedure (RPC) for tournament player registrations
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. PROFILES: Schema Additions & Missing Columns
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending';

-- Performance indexes for filter/query performance
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON public.profiles (approval_status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_chess_username ON public.profiles (chess_username);

-- -----------------------------------------------------------------------------
-- 2. PROFILES: Row Level Security (RLS) Policy Fixes
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2A. Allow newly registered users to insert their own profile record (Fixes signup RLS error)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2B. Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
CREATE POLICY "Users can update their own profiles" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2C. Allow admins to update any profile (Fixes player approval status updates failing)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2D. Ensure public profiles are readable by everyone
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);


-- -----------------------------------------------------------------------------
-- 3. VERIFIED GAMES: RLS Policy Fixes
-- -----------------------------------------------------------------------------
ALTER TABLE public.verified_games ENABLE ROW LEVEL SECURITY;

-- 3A. Allow regular authenticated players to submit scanned games for verification
DROP POLICY IF EXISTS "Players can submit verified games" ON public.verified_games;
CREATE POLICY "Players can submit verified games" ON public.verified_games
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 3B. Viewable by all
DROP POLICY IF EXISTS "Verified games are viewable by everyone" ON public.verified_games;
CREATE POLICY "Verified games are viewable by everyone" ON public.verified_games
  FOR SELECT USING (true);

-- 3C. Only admins can approve, update or delete verified games
DROP POLICY IF EXISTS "Only admins can modify verified games" ON public.verified_games;
DROP POLICY IF EXISTS "Admins can update verified games" ON public.verified_games;
CREATE POLICY "Admins can update verified games" ON public.verified_games
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete verified games" ON public.verified_games;
CREATE POLICY "Admins can delete verified games" ON public.verified_games
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- -----------------------------------------------------------------------------
-- 4. AWARDS: RLS Policy Fixes
-- -----------------------------------------------------------------------------
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

-- 4A. Viewable by everyone
DROP POLICY IF EXISTS "Awards are viewable by everyone" ON public.awards;
CREATE POLICY "Awards are viewable by everyone" ON public.awards
  FOR SELECT USING (true);

-- 4B. Allow award generation writes by admins or authenticated engine runs
DROP POLICY IF EXISTS "Authenticated users or admin can insert awards" ON public.awards;
CREATE POLICY "Authenticated users or admin can insert awards" ON public.awards
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage awards" ON public.awards;
CREATE POLICY "Admins can manage awards" ON public.awards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- -----------------------------------------------------------------------------
-- 5. REALTIME REPLICATION: Enable match_messages
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    -- Ensure match_messages is published to realtime subscribers
    ALTER PUBLICATION supabase_realtime ADD TABLE public.match_messages;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignore duplicate table addition errors gracefully
  NULL;
END $$;


-- -----------------------------------------------------------------------------
-- 6. AUTOMATED USER PROFILE CREATION TRIGGER
-- Ensures every signup in auth.users immediately creates a profile in public.profiles,
-- preventing client-side GoTrue AuthLock deadlocks and signup drops.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    approval_status,
    created_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'player',
    'pending',
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- -----------------------------------------------------------------------------
-- 7. ATOMIC TOURNAMENT REGISTRATION RPC
-- Replaces client-side read-modify-write on tournaments.players with an atomic
-- database-level array append, preventing race conditions and lost registrations.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.register_tournament_player(
  target_tournament_id text,
  new_player jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_players jsonb;
BEGIN
  UPDATE public.tournaments
  SET players = (
    SELECT COALESCE(
      jsonb_agg(elem),
      '[]'::jsonb
    )
    FROM jsonb_array_elements(COALESCE(players, '[]'::jsonb)) elem
    WHERE elem->>'id' != new_player->>'id'
  ) || jsonb_build_array(new_player)
  WHERE id = target_tournament_id
  RETURNING players INTO updated_players;

  RETURN updated_players;
END;
$$;
