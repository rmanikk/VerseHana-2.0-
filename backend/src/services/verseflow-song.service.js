
import pool from "../config/database.js";

export async function linkClassifiedCandidatesToSongs({
  category = null,
  runId = null,
  limit = 100,
} = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);

  const client = await pool.connect();

  const results = {
    processed: 0,
    linked: 0,
    errors: [],
  };

  try {
    await client.query("BEGIN");

    const candidates = await client.query(
      `
        SELECT
          id,
          artist,
          normalized_song_title,
          category,
          language_code,
          featured_artists,
          moods,
          genres
        FROM verseflow_candidates
        WHERE classification_status = 'classified'
          AND song_id IS NULL
          AND ($1::varchar IS NULL OR category = $1)
          AND ($2::uuid IS NULL OR discovered_by_run = $2)
        ORDER BY relevance_score DESC
        LIMIT $3
        FOR UPDATE
      `,
      [category, runId, safeLimit]
    );

    for (const candidate of candidates.rows) {
      try {
        const song = await client.query(
          `
            INSERT INTO verseflow_songs (
              artist,
              normalized_title,
              category,
              language_code,
              featured_artists,
              moods,
              genres
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (
              LOWER(TRIM(artist)),
              LOWER(TRIM(normalized_title)),
              category
            )
            DO UPDATE SET
              language_code = COALESCE(
                verseflow_songs.language_code,
                EXCLUDED.language_code
              ),

              featured_artists = ARRAY(
                SELECT DISTINCT value
                FROM unnest(
                  verseflow_songs.featured_artists ||
                  EXCLUDED.featured_artists
                ) AS artists(value)
                WHERE NULLIF(BTRIM(value), '') IS NOT NULL
              ),

              moods = (
                SELECT COALESCE(jsonb_agg(DISTINCT item), '[]'::jsonb)
                FROM (
                  SELECT jsonb_array_elements(
                    verseflow_songs.moods
                  ) AS item
                  UNION
                  SELECT jsonb_array_elements(EXCLUDED.moods) AS item
                ) AS combined_moods
              ),

              genres = (
                SELECT COALESCE(jsonb_agg(DISTINCT item), '[]'::jsonb)
                FROM (
                  SELECT jsonb_array_elements(
                    verseflow_songs.genres
                  ) AS item
                  UNION
                  SELECT jsonb_array_elements(EXCLUDED.genres) AS item
                ) AS combined_genres
              ),

              updated_at = CURRENT_TIMESTAMP

            RETURNING id
          `,
          [
            candidate.artist,
            candidate.normalized_song_title,
            candidate.category,
            candidate.language_code,
            candidate.featured_artists || [],
            JSON.stringify(candidate.moods || []),
            JSON.stringify(candidate.genres || []),
          ]
        );

        const songId = song.rows[0].id;

        await client.query(
          `
            UPDATE verseflow_candidates
            SET
              song_id = $1,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
          `,
          [songId, candidate.id]
        );

        results.processed++;
        results.linked++;
      } catch (error) {
        results.errors.push({
          candidateId: candidate.id,
          message: error.message,
        });

        throw error;
      }
    }

    await client.query("COMMIT");

    return {
      success: true,
      category,
      runId,
      ...results,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
