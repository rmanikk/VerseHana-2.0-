
-- =====================================================
-- VERSEHANA 2.0 — VERSEFLOW BOT
-- =====================================================

CREATE TABLE IF NOT EXISTS verseflow_bot_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    run_type VARCHAR(40) NOT NULL
        CHECK (run_type IN (
            'discovery',
            'trend_analysis',
            'content_generation'
        )),

    category VARCHAR(20)
        CHECK (
            category IS NULL OR
            category IN ('global', 'nepali', 'hindi')
        ),

    status VARCHAR(20) NOT NULL DEFAULT 'queued'
        CHECK (status IN ('queued', 'running', 'completed', 'failed')),

    trigger_type VARCHAR(20) NOT NULL DEFAULT 'manual'
        CHECK (trigger_type IN ('manual', 'scheduled')),

    started_by UUID
        REFERENCES users(id) ON DELETE SET NULL,

    results JSONB NOT NULL DEFAULT '{}'::jsonb,

    error_message TEXT,

    started_at TIMESTAMPTZ,

    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_verseflow_runs_status
ON verseflow_bot_runs(status);

CREATE INDEX IF NOT EXISTS idx_verseflow_runs_created
ON verseflow_bot_runs(created_at DESC);


-- =====================================================
-- DISCOVERED MUSIC CANDIDATES
-- =====================================================

CREATE TABLE IF NOT EXISTS verseflow_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    source_name VARCHAR(50) NOT NULL,

    source_item_id TEXT NOT NULL,

    source_url TEXT,

    title VARCHAR(255) NOT NULL,

    artist VARCHAR(255) NOT NULL,

    album VARCHAR(255),

    thumbnail_url TEXT,

    duration_seconds INTEGER
        CHECK (duration_seconds IS NULL OR duration_seconds > 0),

    language_code VARCHAR(20),

    category VARCHAR(20)
        CHECK (category IN ('global', 'nepali', 'hindi')),

    moods JSONB NOT NULL DEFAULT '[]'::jsonb
        CHECK (jsonb_typeof(moods) = 'array'),

    genres JSONB NOT NULL DEFAULT '[]'::jsonb
        CHECK (jsonb_typeof(genres) = 'array'),

    popularity_score NUMERIC(5,2) DEFAULT 0
        CHECK (popularity_score >= 0 AND popularity_score <= 100),

    trend_score NUMERIC(8,2) DEFAULT 0
        CHECK (trend_score >= 0),

    rights_status VARCHAR(20) NOT NULL DEFAULT 'unknown'
        CHECK (rights_status IN ('unknown', 'pending', 'cleared', 'restricted')),

    discovery_status VARCHAR(20) NOT NULL DEFAULT 'discovered'
        CHECK (discovery_status IN ('discovered', 'selected', 'rejected', 'duplicate')),

    raw_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    discovered_by_run UUID
        REFERENCES verseflow_bot_runs(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (source_name, source_item_id)
);

CREATE INDEX IF NOT EXISTS idx_verseflow_candidates_category
ON verseflow_candidates(category);

CREATE INDEX IF NOT EXISTS idx_verseflow_candidates_rights
ON verseflow_candidates(rights_status);

CREATE INDEX IF NOT EXISTS idx_verseflow_candidates_discovery
ON verseflow_candidates(discovery_status);

CREATE INDEX IF NOT EXISTS idx_verseflow_candidates_trend
ON verseflow_candidates(trend_score DESC);
