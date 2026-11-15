
ALTER TABLE verseflow_candidates
ADD COLUMN IF NOT EXISTS source_artist_channel_id UUID
REFERENCES verseflow_artist_channels(id)
ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_verseflow_candidates_artist_channel
ON verseflow_candidates(source_artist_channel_id);
