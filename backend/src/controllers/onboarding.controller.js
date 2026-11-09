
import { query } from "../config/database.js";

function validatePreferences(body) {
  const fields = [
    "moodPreferences",
    "pulseInterests",
    "musicPreferences",
  ];

  for (const field of fields) {
    const value = body?.[field];

    if (
      !Array.isArray(value) ||
      value.length > 20 ||
      !value.every(
        (item) =>
          typeof item === "string" &&
          item.trim().length > 0 &&
          item.length <= 80
      )
    ) {
      return false;
    }
  }

  return true;
}

// GET /api/onboarding
export async function getOnboarding(req, res, next) {
  try {
    const result = await query(
      `SELECT
         u.onboarding_completed,
         COALESCE(p.mood_preferences, '[]'::jsonb) AS mood_preferences,
         COALESCE(p.pulse_interests, '[]'::jsonb) AS pulse_interests,
         COALESCE(p.music_preferences, '[]'::jsonb) AS music_preferences
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

    return res.json({
      success: true,
      onboarding: {
        completed: result.rows[0].onboarding_completed,
        moodPreferences: result.rows[0].mood_preferences,
        pulseInterests: result.rows[0].pulse_interests,
        musicPreferences: result.rows[0].music_preferences,
      },
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/onboarding
export async function saveOnboarding(req, res, next) {
  try {
    if (!validatePreferences(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Invalid onboarding preferences.",
      });
    }

    const {
      moodPreferences,
      pulseInterests,
      musicPreferences,
    } = req.body;

    await query(
      `WITH saved_preferences AS (
  INSERT INTO user_onboarding_preferences (
    user_id,
    mood_preferences,
    pulse_interests,
    music_preferences
  )
  VALUES ($1, $2::jsonb, $3::jsonb, $4::jsonb)
  ON CONFLICT (user_id)
  DO UPDATE SET
    mood_preferences = EXCLUDED.mood_preferences,
    pulse_interests = EXCLUDED.pulse_interests,
    music_preferences = EXCLUDED.music_preferences,
    updated_at = CURRENT_TIMESTAMP
  RETURNING user_id
)
UPDATE users
SET onboarding_completed = TRUE,
    updated_at = CURRENT_TIMESTAMP
WHERE id = (SELECT user_id FROM saved_preferences)`,
      [
        req.user.id,
        JSON.stringify(moodPreferences),
        JSON.stringify(pulseInterests),
        JSON.stringify(musicPreferences),
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
