
-- =====================================================
-- VERSEHANA 2.0 — DATABASE SCHEMA
-- =====================================================

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    full_name VARCHAR(100) NOT NULL,

    username VARCHAR(30) NOT NULL UNIQUE,

    email VARCHAR(255) UNIQUE,

    password_hash TEXT,

    auth_provider VARCHAR(20) NOT NULL DEFAULT 'local',

    google_id VARCHAR(255) UNIQUE,

    facebook_id VARCHAR(255) UNIQUE,

    email_verified BOOLEAN NOT NULL DEFAULT FALSE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_auth_provider
        CHECK (auth_provider IN ('local', 'google', 'facebook'))
);

-- Keep existing databases compatible with this schema.
ALTER TABLE users
    ALTER COLUMN email DROP NOT NULL;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS facebook_id VARCHAR(255) UNIQUE;

-- Ensure all three authentication providers are supported.
ALTER TABLE users
    DROP CONSTRAINT IF EXISTS valid_auth_provider;

ALTER TABLE users
    ADD CONSTRAINT valid_auth_provider
    CHECK (auth_provider IN ('local', 'google', 'facebook'));

-- USER INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_username
ON users(username);

CREATE INDEX IF NOT EXISTS idx_users_google_id
ON users(google_id);

CREATE INDEX IF NOT EXISTS idx_users_facebook_id
ON users(facebook_id);


-- =====================================================
-- EMAIL OTP VERIFICATION RECORDS
-- =====================================================

CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    otp_hash TEXT NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,

    attempts INTEGER NOT NULL DEFAULT 0,

    verified_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_user
ON email_verifications(user_id);


-- =====================================================
-- PERSISTENT LOGIN / REFRESH SESSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS refresh_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,

    revoked_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refresh_sessions_user
ON refresh_sessions(user_id);
