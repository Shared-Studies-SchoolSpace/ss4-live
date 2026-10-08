-- =============================================================================
-- Migration 03: SS4 Partner Onboarding & Sponsorship Intake Schema
-- Target Table: public.partner_offers
-- Target View:  public.v_partner_offers_summary
-- Platform:    SS4 / SCL (Supabase PostgreSQL)
-- 
-- Description:
-- Stores submissions from the /partner/onboarding portal.
-- Includes Row-Level Security (RLS) allowing public/guest submissions,
-- administrative controls, indexing, realtime publication, and an
-- automated updated_at timestamp trigger.
-- =============================================================================

-- Enable pgcrypto extension for gen_random_uuid if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Create Partner Offers Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.partner_offers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_code text NOT NULL,

  -- Section 1: About You
  full_name text NOT NULL,
  state_of_residence text,
  phone text NOT NULL,
  email text NOT NULL,
  profession text,
  organization text,
  social_profile text,

  -- Section 2: Communication Protocol
  preferred_contact_method text NOT NULL DEFAULT 'whatsapp',
  preferred_contact_method_other text,
  email_frequency text NOT NULL DEFAULT 'once_a_day',
  preferred_time_window text DEFAULT 'morning',

  -- Section 3: Your Partnership
  partnership_interests text,
  contributions text[] DEFAULT '{}'::text[],
  contribution_other text,

  -- Section 4: SCL Monthly Sponsorship
  sponsorship_amount_monthly text DEFAULT '50,000',
  sponsorship_duration text DEFAULT '3 months',
  sponsorship_duration_other text,

  -- Section 5: Recognition & Discovery
  public_recognition boolean DEFAULT true,
  recognition_name text,
  referral_source text,
  referral_source_other text,
  additional_notes text,

  -- Section 6: Confirmation
  confirmation_name text NOT NULL,
  confirmation_date text,

  -- Admin & Intake Workflow
  status text DEFAULT 'pending' NOT NULL,
  admin_notes text,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamp with time zone,

  -- Timestamps
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Constraints
  CONSTRAINT chk_partner_offer_status CHECK (
    status IN ('pending', 'in_review', 'contacted', 'approved', 'declined', 'archived')
  ),
  CONSTRAINT chk_preferred_contact_method CHECK (
    preferred_contact_method IN ('whatsapp', 'email', 'other')
  ),
  CONSTRAINT chk_email_frequency CHECK (
    email_frequency IN (
      'once_a_day',
      'every_morning',
      'every_evening',
      'multiple_times_a_day',
      'few_times_a_week'
    )
  )
);

-- Ensure unique constraint on reference_code
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_partner_offers_reference_code'
  ) THEN
    ALTER TABLE public.partner_offers 
      ADD CONSTRAINT uq_partner_offers_reference_code UNIQUE (reference_code);
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2. Performance & Query Indexes
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_partner_offers_reference_code ON public.partner_offers (reference_code);
CREATE INDEX IF NOT EXISTS idx_partner_offers_email ON public.partner_offers (email);
CREATE INDEX IF NOT EXISTS idx_partner_offers_phone ON public.partner_offers (phone);
CREATE INDEX IF NOT EXISTS idx_partner_offers_status ON public.partner_offers (status);
CREATE INDEX IF NOT EXISTS idx_partner_offers_preferred_contact ON public.partner_offers (preferred_contact_method);
CREATE INDEX IF NOT EXISTS idx_partner_offers_email_freq ON public.partner_offers (email_frequency);
CREATE INDEX IF NOT EXISTS idx_partner_offers_created_at ON public.partner_offers (created_at DESC);

-- GIN index for fast filtering inside the contributions array
CREATE INDEX IF NOT EXISTS idx_partner_offers_contributions ON public.partner_offers USING GIN (contributions);

-- -----------------------------------------------------------------------------
-- 3. Row Level Security (RLS) Configuration
-- -----------------------------------------------------------------------------
ALTER TABLE public.partner_offers ENABLE ROW LEVEL SECURITY;

-- 3A. Public Intake (Anyone, including guests/unauthenticated visitors, can submit an offer)
DROP POLICY IF EXISTS "Anyone can submit a partner offer" ON public.partner_offers;
DROP POLICY IF EXISTS "Public can submit partner offers" ON public.partner_offers;
CREATE POLICY "Anyone can submit a partner offer" ON public.partner_offers
  FOR INSERT WITH CHECK (true);

-- 3B. Admins can view all submissions
DROP POLICY IF EXISTS "Admins can view partner offers" ON public.partner_offers;
CREATE POLICY "Admins can view partner offers" ON public.partner_offers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3C. Admins can update submissions (status, admin notes, review metadata)
DROP POLICY IF EXISTS "Admins can update partner offers" ON public.partner_offers;
CREATE POLICY "Admins can update partner offers" ON public.partner_offers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3D. Admins can delete submissions if necessary (cleanup/purging spam)
DROP POLICY IF EXISTS "Admins can delete partner offers" ON public.partner_offers;
CREATE POLICY "Admins can delete partner offers" ON public.partner_offers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- 4. Automated updated_at Trigger
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_partner_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_partner_offers_updated_at ON public.partner_offers;
CREATE TRIGGER trg_partner_offers_updated_at
  BEFORE UPDATE ON public.partner_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_partner_offers_updated_at();

-- -----------------------------------------------------------------------------
-- 5. Realtime Replication Publication
-- Enables instant notification in admin dashboards when a partner submits an offer
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_offers;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore gracefully if already added
END $$;

-- -----------------------------------------------------------------------------
-- 6. Helper View: Aggregated Partner Dashboard Metrics
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_partner_offers_summary AS
SELECT
  id,
  reference_code,
  full_name,
  organization,
  phone,
  email,
  preferred_contact_method,
  preferred_contact_method_other,
  email_frequency,
  preferred_time_window,
  sponsorship_amount_monthly,
  -- Parse numeric value from string (e.g. '50,000' -> 50000) for analytics
  COALESCE(
    NULLIF(regexp_replace(sponsorship_amount_monthly, '[^0-9.]', '', 'g'), '')::numeric,
    0
  ) AS sponsorship_amount_numeric,
  sponsorship_duration,
  contributions,
  public_recognition,
  recognition_name,
  status,
  created_at
FROM public.partner_offers
ORDER BY created_at DESC;

-- Grant permissions on the view to authenticated admins
GRANT SELECT ON public.v_partner_offers_summary TO authenticated;
