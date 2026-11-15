
CREATE TABLE IF NOT EXISTS verseflow_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    artist VARCHAR(200) NOT NULL,
    normalized_title TEXT NOT NULL,

    category VARCHAR(20) NOT NULL
        CHECK (category IN ('global', 'nepali', 'hindi')),

    language_code VARCHAR(10),

    featured_artists TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

    moods JSONB NOT NULL DEFAULT '[]'::jsonb,
    genres JSONB NOT NULL DEFAULT '[]'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Prevent the same artist and song from being registered
-- more than once within the same category.
CREATE UNIQUE INDEX IF NOT EXISTS
    idx_verseflow_songs_identity
ON verseflow_songs (
    LOWER(TRIM(artist)),
    LOWER(TRIM(normalized_title)),
    category
);

-- Connect individual video candidates to their canonical song.
ALTER TABLE verseflow_candidates
ADD COLUMN IF NOT EXISTS song_id UUID
REFERENCES verseflow_songs(id)
ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS
    idx_verseflow_candidates_song
ON verseflow_candidates(song_id);
