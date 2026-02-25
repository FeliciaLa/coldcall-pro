-- ColdCall Pro — Supabase/Postgres schema (from build spec)

-- Users table (synced with Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  simulations_remaining INTEGER DEFAULT 50,
  has_paid BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simulation history
CREATE TABLE simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  anonymous_id TEXT,
  scenario_id TEXT NOT NULL,
  transcript JSONB,
  scorecard JSONB,
  duration_seconds INTEGER,
  overall_score INTEGER,
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Free simulation tracking (anonymous); used_count = number of free calls used (max 3)
CREATE TABLE free_sims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id TEXT UNIQUE NOT NULL,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration for existing DBs that have "used" boolean:
-- ALTER TABLE free_sims ADD COLUMN IF NOT EXISTS used_count INTEGER DEFAULT 0;
-- UPDATE free_sims SET used_count = CASE WHEN used THEN 3 ELSE 0 END;
-- ALTER TABLE free_sims DROP COLUMN IF EXISTS used;

-- Anonymous purchases (Stripe checkout; no Clerk)
CREATE TABLE anon_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id TEXT UNIQUE NOT NULL,
  stripe_session_id TEXT UNIQUE,
  simulations_remaining INTEGER DEFAULT 50,
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);
