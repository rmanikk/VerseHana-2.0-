
ALTER TABLE verseflow_candidates
ADD COLUMN IF NOT EXISTS relevance_score NUMERIC(5, 2)
NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_verseflow_candidates_relevance
ON verseflow_candidates (relevance_score DESC);
