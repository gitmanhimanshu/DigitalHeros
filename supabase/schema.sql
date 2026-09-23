-- Digital Heroes - PostgreSQL / Supabase Migration Schema
-- Edition: March 2026 PRD Level 1

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'SUBSCRIBER' CHECK (role IN ('SUBSCRIBER', 'ADMIN')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Charities Table
CREATE TABLE IF NOT EXISTS charities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Health', 'Youth', 'Veterans', 'Environment', 'Community')),
    mission TEXT NOT NULL,
    description TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    cover_image_url TEXT NOT NULL,
    featured BOOLEAN NOT NULL DEFAULT false,
    total_raised DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    active_supporters INT NOT NULL DEFAULT 0,
    upcoming_events JSONB NOT NULL DEFAULT '[]'::jsonb,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL DEFAULT 'MONTHLY' CHECK (plan_type IN ('MONTHLY', 'YEARLY')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'CANCELLED', 'LAPSED')),
    price DOUBLE PRECISION NOT NULL DEFAULT 29.0,
    charity_id TEXT REFERENCES charities(id) ON DELETE SET NULL,
    charity_percent DOUBLE PRECISION NOT NULL DEFAULT 10.0 CHECK (charity_percent >= 10.0 AND charity_percent <= 100.0),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    renewal_date TIMESTAMPTZ NOT NULL,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Charity Donations Table (Subscription allocations + Direct Donations)
CREATE TABLE IF NOT EXISTS charity_donations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    charity_id TEXT NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
    donor_name TEXT,
    donor_email TEXT,
    amount DOUBLE PRECISION NOT NULL,
    type TEXT NOT NULL DEFAULT 'SUBSCRIPTION_SHARE' CHECK (type IN ('SUBSCRIPTION_SHARE', 'DIRECT_DONATION')),
    stripe_payment_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Golf Scores Table (Rolling 5 retention enforced, 1 per date per user)
CREATE TABLE IF NOT EXISTS golf_scores (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INT NOT NULL CHECK (score >= 1 AND score <= 45), -- Stableford format
    played_on TIMESTAMPTZ NOT NULL,
    course_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_played_on UNIQUE (user_id, played_on)
);

CREATE INDEX IF NOT EXISTS idx_golf_scores_user_date ON golf_scores(user_id, played_on DESC);

-- 6. Draws Table
CREATE TABLE IF NOT EXISTS draws (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    draw_number INT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    draw_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'SIMULATED', 'PUBLISHED')),
    draw_logic TEXT NOT NULL DEFAULT 'RANDOM' CHECK (draw_logic IN ('RANDOM', 'ALGORITHMIC')),
    cadence TEXT NOT NULL DEFAULT 'MONTHLY' CHECK (cadence IN ('MONTHLY', 'SPECIAL')),
    winning_numbers JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_prize_pool DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    jackpot_rollover_in DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    jackpot_rollover_out DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    tier5_winners_count INT NOT NULL DEFAULT 0,
    tier4_winners_count INT NOT NULL DEFAULT 0,
    tier3_winners_count INT NOT NULL DEFAULT 0,
    tier5_prize_per_winner DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    tier4_prize_per_winner DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    tier3_prize_per_winner DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    simulation_data JSONB,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Draw Entries Table
CREATE TABLE IF NOT EXISTS draw_entries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    draw_id TEXT NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_scores JSONB NOT NULL,
    matched_count INT NOT NULL DEFAULT 0 CHECK (matched_count >= 0 AND matched_count <= 5),
    matched_numbers JSONB NOT NULL DEFAULT '[]'::jsonb,
    tier TEXT NOT NULL DEFAULT 'NONE' CHECK (tier IN ('MATCH_5', 'MATCH_4', 'MATCH_3', 'NONE')),
    prize_won DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_draw_user UNIQUE (draw_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_draw_entries_draw_tier ON draw_entries(draw_id, tier);

-- 8. Winner Verifications Table
CREATE TABLE IF NOT EXISTS winner_verifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    draw_id TEXT NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
    draw_entry_id TEXT REFERENCES draw_entries(id) ON DELETE SET NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK (tier IN ('MATCH_5', 'MATCH_4', 'MATCH_3')),
    prize_amount DOUBLE PRECISION NOT NULL,
    proof_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    payout_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payout_status IN ('PENDING', 'PAID')),
    admin_notes TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verifications_user ON winner_verifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_verifications_draw ON winner_verifications(draw_id, status);

-- 9. Platform Settings Table
CREATE TABLE IF NOT EXISTS platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

