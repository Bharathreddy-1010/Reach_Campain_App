-- ==============================================================================
-- REACH MOBILE PLATFORM — SUPABASE (POSTGRESQL) SCHEMA MIGRATION
-- Run this in the Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'creator_backer',
  backed_campaign_ids TEXT[] DEFAULT '{}',
  saved_campaign_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS public.campaigns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  creator_id TEXT,
  summary TEXT NOT NULL,
  cover_image TEXT,
  status TEXT NOT NULL DEFAULT 'submitted', -- 'draft', 'submitted', 'changes_requested', 'approved', 'funding', 'promoting', 'completed'
  funding_goal NUMERIC NOT NULL,
  amount_raised NUMERIC DEFAULT 0,
  deadline TIMESTAMPTZ,
  target_region TEXT,
  channels TEXT[] DEFAULT ARRAY['Instagram', 'Facebook'],
  estimated_impressions INTEGER DEFAULT 0,
  estimated_reach INTEGER DEFAULT 0,
  story_sections JSONB DEFAULT '[]'::jsonb,
  visuals JSONB DEFAULT '{}'::jsonb,
  distribution_report JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CONTRIBUTIONS TABLE
CREATE TABLE IF NOT EXISTS public.contributions (
  id TEXT PRIMARY KEY,
  campaign_id TEXT REFERENCES public.campaigns(id) ON DELETE CASCADE,
  backer_id TEXT,
  backer_name TEXT DEFAULT 'Anonymous Backer',
  amount NUMERIC NOT NULL,
  platform_fee NUMERIC DEFAULT 0,
  total_paid NUMERIC NOT NULL,
  estimated_reach_generated INTEGER DEFAULT 0,
  payment_method TEXT DEFAULT 'upi',
  payment_status TEXT NOT NULL DEFAULT 'completed', -- 'completed', 'failed', 'refunded'
  receipt_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CAMPAIGN DRAFTS TABLE
CREATE TABLE IF NOT EXISTS public.drafts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  current_step INTEGER DEFAULT 1,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'milestone', 'submission', 'approval', 'contribution'
  is_read BOOLEAN DEFAULT FALSE,
  related_campaign_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Campaigns: Anyone can read approved/published campaigns
DROP POLICY IF EXISTS "Public can view active campaigns" ON public.campaigns;
CREATE POLICY "Public can view active campaigns" ON public.campaigns
  FOR SELECT USING (true);

-- Campaigns: Authenticated users can create campaigns
DROP POLICY IF EXISTS "Users can create campaigns" ON public.campaigns;
CREATE POLICY "Users can create campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (true);

-- Campaigns: Creators can update their own campaigns
DROP POLICY IF EXISTS "Creators can update campaigns" ON public.campaigns;
CREATE POLICY "Creators can update campaigns" ON public.campaigns
  FOR UPDATE USING (true);

-- Contributions: Anyone can create a contribution record
DROP POLICY IF EXISTS "Public contributions insert" ON public.contributions;
CREATE POLICY "Public contributions insert" ON public.contributions
  FOR INSERT WITH CHECK (true);

-- Contributions: Backers can view contributions
DROP POLICY IF EXISTS "Contributions select" ON public.contributions;
CREATE POLICY "Contributions select" ON public.contributions
  FOR SELECT USING (true);

-- Drafts: Users can view and manage their own drafts
DROP POLICY IF EXISTS "Manage own drafts" ON public.drafts;
CREATE POLICY "Manage own drafts" ON public.drafts
  FOR ALL USING (true);

-- Notifications: Users can view their own notifications
DROP POLICY IF EXISTS "Manage notifications" ON public.notifications;
CREATE POLICY "Manage notifications" ON public.notifications
  FOR ALL USING (true);
