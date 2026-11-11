
import { query } from "../config/database.js";

const VALID_MOODS = [
  "happy",
  "calm",
  "rain",
  "night",
  "love",
  "focus",
  "party",
  "sad",
];

function validateOnboarding(body) {
  const { selectedMood, favoriteArtistIds } = body ?? {};

  if (!VALID_MOODS.includes(selectedMood)) {
    return false;
  }

  if (
    !Array.isArray(favoriteArtistIds) ||
    favoriteArtistIds.length > 30 ||
    !favoriteArtistIds.every(
      (id) =>
        typeof id === "string" &&
        id.trim().length > 0 &&
        id.length <= 100
    )
  ) {
    return false;
  }

  return true;
}

// GET /api/auth/onboarding
export async function getOnboarding(req, res, next) {
  try {
    const result = await query(
      `SELECT
         u.onboarding_completed,
         p.selected_mood,
         COALESCE(p.favorite_artist_ids, '[]'::jsonb)
           AS favorite_artist_ids
       FROM users u
       LEFT JOIN user_onboarding_preferences p
         ON p.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const row = result.rows[0];

    return res.json({
      success: true,
      onboarding: {
        completed: row.onboarding_completed,
        selectedMood: row.selected_mood,
        favoriteArtistIds: row.favorite_artist_ids,
      },
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/auth/onboarding
export async function saveOnboarding(req, res, next) {
  try {
    if (!validateOnboarding(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Invalid onboarding preferences.",
      });
    }

    const { selectedMood, favoriteArtistIds } = req.body;

    await query(
      `WITH saved_preferences AS (
         INSERT INTO user_onboarding_preferences (
           user_id,
           selected_mood,
           favorite_artist_ids
         )
         VALUES ($1, $2, $3::jsonb)
         ON CONFLICT (user_id)
         DO UPDATE SET
           selected_mood = EXCLUDED.selected_mood,
           favorite_artist_ids = EXCLUDED.favorite_artist_ids,
           updated_at = CURRENT_TIMESTAMP
         RETURNING user_id
       )
       UPDATE users
       SET onboarding_completed = TRUE,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = (
         SELECT user_id FROM saved_preferences
       )`,
      [
        req.user.id,
        selectedMood,
        JSON.stringify(favoriteArtistIds),
      ]
    );

    return res.json({
      success: true,
      message: "Onboarding completed successfully.",
    });
  } catch (error) {
    next(error);
  }
}
