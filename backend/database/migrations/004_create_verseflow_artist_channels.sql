
CREATE TABLE IF NOT EXISTS verseflow_artist_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    artist_name VARCHAR(200) NOT NULL,
    channel_id VARCHAR(100) NOT NULL UNIQUE,
    channel_url TEXT NOT NULL,

    category VARCHAR(20) NOT NULL
        CHECK (category IN ('global', 'nepali', 'hindi')),

    language_code VARCHAR(10),

    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (
            verification_status IN (
                'pending',
                'verified',
                'rejected'
            )
        ),

    permission_status VARCHAR(20) NOT NULL DEFAULT 'unknown'
        CHECK (
            permission_status IN (
                'unknown',
                'pending',
                'authorized',
                'restricted',
                'expired'
            )
        ),

    permission_evidence_url TEXT,
    permission_notes TEXT,
    permission_verified_at TIMESTAMPTZ,
    permission_expires_at TIMESTAMPTZ,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_verseflow_artist_channels_category
ON verseflow_artist_channels (category);

CREATE INDEX IF NOT EXISTS idx_verseflow_artist_channels_status
ON verseflow_artist_channels (
    verification_status,
    permission_status,
    is_active
);
