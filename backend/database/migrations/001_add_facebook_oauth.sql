BEGIN;

-- Add Facebook's unique account identifier.
ALTER TABLE users
ADD COLUMN IF NOT EXISTS facebook_id VARCHAR(255);

-- Prevent multiple accounts from using the same Facebook ID.
CREATE UNIQUE INDEX IF NOT EXISTS users_facebook_id_unique
ON users (facebook_id)
WHERE facebook_id IS NOT NULL;

-- Allow Facebook as an authentication provider.
ALTER TABLE users
DROP CONSTRAINT IF EXISTS valid_auth_provider;

ALTER TABLE users
ADD CONSTRAINT valid_auth_provider
CHECK (auth_provider IN ('local', 'google', 'facebook'));

COMMIT;
