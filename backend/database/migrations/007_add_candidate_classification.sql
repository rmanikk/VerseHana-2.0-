
ALTER TABLE verseflow_candidates
ADD COLUMN IF NOT EXISTS normalized_song_title TEXT;

ALTER TABLE verseflow_candidates
ADD COLUMN IF NOT EXISTS featured_artists TEXT[]
NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE verseflow_candidates
ADD COLUMN IF NOT EXISTS content_type VARCHAR(30)
NOT NULL DEFAULT 'unclassified';

ALTER TABLE verseflow_candidates
ADD COLUMN IF NOT EXISTS classification_status VARCHAR(20)
NOT NULL DEFAULT 'pending';

ALTER TABLE verseflow_candidates
ADD CONSTRAINT verseflow_candidates_content_type_check
CHECK (
  content_type IN (
    'unclassified',
    'official_video',
    'lyric_video',
    'visualizer',
    'live_performance',
    'audio',
    'other'
  )
);

ALTER TABLE verseflow_candidates
ADD CONSTRAINT verseflow_candidates_classification_status_check
CHECK (
  classification_status IN (
    'pending',
    'classified',
    'review_required'
  )
);

CREATE INDEX IF NOT EXISTS idx_verseflow_candidates_classification
ON verseflow_candidates(classification_status, content_type);
