
-- =====================================================
-- VERSEHANA 2.0 — USER PLAYLISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS user_playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL,

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_playlist_name
        CHECK (LENGTH(TRIM(name)) > 0)
);

-- Efficiently retrieve a user's playlists.
CREATE INDEX IF NOT EXISTS idx_user_playlists_user
ON user_playlists(user_id, created_at DESC);


-- =====================================================
-- SONGS INSIDE PLAYLISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS user_playlist_songs (
    playlist_id UUID NOT NULL
        REFERENCES user_playlists(id) ON DELETE CASCADE,

    song_id UUID NOT NULL
        REFERENCES verseflow_songs(id) ON DELETE CASCADE,

    position INTEGER NOT NULL,

    added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (playlist_id, song_id),

    CONSTRAINT valid_playlist_song_position
        CHECK (position >= 0),

    CONSTRAINT unique_playlist_song_position
        UNIQUE (playlist_id, position)
);

-- Efficiently retrieve songs in playlist order.
CREATE INDEX IF NOT EXISTS idx_user_playlist_songs_order
ON user_playlist_songs(playlist_id, position);
