
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(20)
NOT NULL DEFAULT 'user';

ALTER TABLE users
ADD CONSTRAINT valid_user_role
CHECK (role IN ('user', 'admin'));

CREATE INDEX IF NOT EXISTS idx_users_role
ON users(role);
