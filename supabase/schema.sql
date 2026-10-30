-- =========================================================================
-- VoxCraft AI: Production PostgreSQL Schema Migration
-- Compatible with Supabase PostgreSQL 15 & 16
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Users & Subscription State)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'creator', 'pro', 'enterprise')),
    credits_balance INTEGER NOT NULL DEFAULT 10000 CHECK (credits_balance >= 0),
    credits_total_used INTEGER NOT NULL DEFAULT 0,
    stripe_customer_id TEXT UNIQUE,
    credits_reset_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. VOICE PRESETS (Curated Voice Library)
CREATE TABLE IF NOT EXISTS public.voice_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('conversational', 'narration', 'characters', 'social_media')),
    gender TEXT NOT NULL CHECK (gender IN ('female', 'male', 'non-binary')),
    accent TEXT NOT NULL,
    description TEXT,
    sample_text TEXT NOT NULL,
    preview_audio_url TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_voice_id TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. AUDIO GENERATIONS (Speech Generation Records)
CREATE TABLE IF NOT EXISTS public.audio_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    voice_id UUID NOT NULL REFERENCES public.voice_presets(id) ON DELETE RESTRICT,
    prompt_text TEXT NOT NULL,
    character_count INTEGER NOT NULL,
    settings_snapshot JSONB NOT NULL,
    audio_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    audio_format TEXT NOT NULL DEFAULT 'audio/wav',
    duration_seconds NUMERIC(6,2) NOT NULL,
    provider_used TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CREDIT TRANSACTIONS (Double-Entry Ledger)
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    generation_id UUID REFERENCES public.audio_generations(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('tts_generation', 'monthly_renewal', 'tier_upgrade', 'top_up')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_generations_user_created ON public.audio_generations (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON public.credit_transactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voices_category_active ON public.voice_presets (category, is_active);

-- Stored Procedure: Atomic Credit Deduction with Row Locking
CREATE OR REPLACE FUNCTION public.deduct_user_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_generation_id UUID,
    p_description TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    SELECT credits_balance INTO v_current_balance
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF v_current_balance IS NULL THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;

    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient credit balance (Required: %, Available: %)', p_amount, v_current_balance;
    END IF;

    v_new_balance := v_current_balance - p_amount;

    UPDATE public.profiles
    SET credits_balance = v_new_balance,
        credits_total_used = credits_total_used + p_amount,
        updated_at = NOW()
    WHERE id = p_user_id;

    INSERT INTO public.credit_transactions (
        user_id,
        generation_id,
        amount,
        balance_after,
        transaction_type,
        description
    ) VALUES (
        p_user_id,
        p_generation_id,
        -p_amount,
        v_new_balance,
        'tts_generation',
        p_description
    );

    RETURN v_new_balance;
END;
$$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_presets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can read own audio generations" ON public.audio_generations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audio generations" ON public.audio_generations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own credit transactions" ON public.credit_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Voice presets are publicly readable" ON public.voice_presets
    FOR SELECT USING (is_active = TRUE);
