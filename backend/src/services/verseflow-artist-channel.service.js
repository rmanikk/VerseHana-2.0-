
import { query } from "../config/database.js";

const VALID_CATEGORIES = ["global", "nepali", "hindi"];


function validateArtistInput({
  artistName,
  channelId,
  channelUrl,
  category,
}) {
  if (!artistName?.trim()) {
    throw new Error("Artist name is required.");
  }

  if (!channelId?.trim()) {
    throw new Error("YouTube channel ID is required.");
  }

  if (!/^UC[\w-]{22}$/.test(channelId.trim())) {
    throw new Error("Invalid YouTube channel ID.");
  }

  if (!channelUrl?.trim()) {
    throw new Error("YouTube channel URL is required.");
  }

  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error("Invalid artist category.");
  }

  try {
    const url = new URL(channelUrl);

    const allowedHosts = [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "music.youtube.com",
    ];

    if (
      !["https:", "http:"].includes(url.protocol) ||
      !allowedHosts.includes(url.hostname)
    ) {
      throw new Error();
    }
  } catch {
    throw new Error("A valid YouTube channel URL is required.");
  }
}


export async function registerArtistChannel({
  artistName,
  channelId,
  channelUrl,
  category,
  languageCode = null,
}) {
  validateArtistInput({
    artistName,
    channelId,
    channelUrl,
    category,
  });

  const result = await query(
    `
      INSERT INTO verseflow_artist_channels (
        artist_name,
        channel_id,
        channel_url,
        category,
        language_code
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (channel_id)
      DO UPDATE SET
        artist_name = EXCLUDED.artist_name,
        channel_url = EXCLUDED.channel_url,
        category = EXCLUDED.category,
        language_code = EXCLUDED.language_code,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `,
    [
      artistName.trim(),
      channelId.trim(),
      channelUrl.trim(),
      category,
      languageCode,
    ]
  );

  return result.rows[0];
}

export async function getArtistChannels({
  category = null,
  verificationStatus = null,
  activeOnly = true,
} = {}) {
  const result = await query(
    `
      SELECT *
      FROM verseflow_artist_channels
      WHERE ($1::VARCHAR IS NULL OR category = $1)
        AND (
          $2::VARCHAR IS NULL
          OR verification_status = $2
        )
        AND ($3::BOOLEAN = FALSE OR is_active = TRUE)
      ORDER BY artist_name ASC
    `,
    [category, verificationStatus, activeOnly]
  );

  return result.rows;
}

export async function updateArtistChannelVerification({
  channelId,
  verificationStatus,
}) {
  if (!channelId?.trim()) {
    throw new Error("Channel ID is required.");
  }

  if (!["pending", "verified", "rejected"].includes(
    verificationStatus
  )) {
    throw new Error("Invalid verification status.");
  }

  const result = await query(
    `
      UPDATE verseflow_artist_channels
      SET
        verification_status = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE channel_id = $1
      RETURNING *
    `,
    [channelId.trim(), verificationStatus]
  );

  if (!result.rows.length) {
    throw new Error("Artist channel not found.");
  }

  return result.rows[0];
}

export async function deactivateArtistChannel(channelId) {
  if (!channelId?.trim()) {
    throw new Error("Channel ID is required.");
  }

  const result = await query(
    `
      UPDATE verseflow_artist_channels
      SET
        is_active = FALSE,
        updated_at = CURRENT_TIMESTAMP
      WHERE channel_id = $1
      RETURNING *
    `,
    [channelId.trim()]
  );

  if (!result.rows.length) {
    throw new Error("Artist channel not found.");
  }

  return result.rows[0];
}
