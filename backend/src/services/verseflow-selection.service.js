
import pool from "../config/database.js";

const CATEGORIES = ["global", "nepali", "hindi"];

const DEFAULT_LIMIT_PER_CATEGORY = 20;

export async function selectVerseFlowCandidates({
  limitPerCategory = DEFAULT_LIMIT_PER_CATEGORY,
} = {}) {
  if (
    !Number.isInteger(limitPerCategory) ||
    limitPerCategory < 1 ||
    limitPerCategory > 100
  ) {
    throw new Error(
      "limitPerCategory must be an integer between 1 and 100."
    );
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const selectedByCategory = {};
    const allSelectedCandidates = [];

    for (const category of CATEGORIES) {
      // Serialize selection runs for this category.
      await client.query(
        `
          SELECT pg_advisory_xact_lock(
            hashtext('verseflow_selection'),
            hashtext($1)
          )
        `,
        [category]
      );

      // Count candidates already selected.
      const countResult = await client.query(
        `
          SELECT COUNT(*)::int AS selected_count
          FROM verseflow_candidates
          WHERE category = $1
            AND discovery_status = 'selected'
        `,
        [category]
      );

      const alreadySelected = countResult.rows[0].selected_count;

      // Never exceed the category's total selection limit.
      const remainingSlots = Math.max(
        0,
        limitPerCategory - alreadySelected
      );

      if (remainingSlots === 0) {
        selectedByCategory[category] = {
          alreadySelected,
          newlySelected: 0,
          totalSelected: alreadySelected,
          remainingSlots: 0,
          candidates: [],
        };

        continue;
      }

      // Select the highest-ranked available candidates.
      const candidatesResult = await client.query(
        `
          SELECT
            id,
            title,
            artist,
            album,
            thumbnail_url,
            duration_seconds,
            category,
            moods,
            genres,
            relevance_score,
            popularity_score,
            trend_score,
            rights_status
          FROM verseflow_candidates
          WHERE category = $1
            AND discovery_status = 'discovered'
          ORDER BY
            relevance_score DESC,
            popularity_score DESC,
            trend_score DESC,
            created_at DESC
          LIMIT $2
          FOR UPDATE SKIP LOCKED
        `,
        [category, remainingSlots]
      );

      const candidates = candidatesResult.rows;

      if (candidates.length === 0) {
        selectedByCategory[category] = {
          alreadySelected,
          newlySelected: 0,
          totalSelected: alreadySelected,
          remainingSlots,
          candidates: [],
        };

        continue;
      }

      const candidateIds = candidates.map(
        (candidate) => candidate.id
      );

      // Update candidate status.
      const updateResult = await client.query(
        `
          UPDATE verseflow_candidates
          SET
            discovery_status = 'selected',
            updated_at = NOW()
          WHERE id = ANY($1::uuid[])
            AND discovery_status = 'discovered'
          RETURNING
            id,
            title,
            artist,
            category,
            moods,
            genres,
            relevance_score,
            popularity_score,
            trend_score,
            rights_status
        `,
        [candidateIds]
      );

      // UPDATE RETURNING does not guarantee ordering.
      // Restore the original ranking order.
      const updatedMap = new Map(
        updateResult.rows.map((candidate) => [
          candidate.id,
          candidate,
        ])
      );

      const orderedCandidates = candidateIds
        .map((id) => updatedMap.get(id))
        .filter(Boolean);

      const newlySelected = orderedCandidates.length;
      const totalSelected = alreadySelected + newlySelected;

      selectedByCategory[category] = {
        alreadySelected,
        newlySelected,
        totalSelected,
        remainingSlots: Math.max(
          0,
          limitPerCategory - totalSelected
        ),
        candidates: orderedCandidates,
      };

      allSelectedCandidates.push(...orderedCandidates);
    }

    await client.query("COMMIT");

    return {
      success: true,
      limitPerCategory,
      totalSelected: allSelectedCandidates.length,
      selectedByCategory,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
