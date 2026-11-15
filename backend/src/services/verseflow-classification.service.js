
import { query } from "../config/database.js";

const CONTENT_TYPES = {
  LIVE: "live_performance",
  LYRIC: "lyric_video",
  VISUALIZER: "visualizer",
  AUDIO: "audio",
  OFFICIAL: "official_video",
  OTHER: "other",
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractFeaturedArtists(title) {
  const match = title.match(
    /\b(?:ft\.?|feat\.?|featuring)\s+(.+?)(?=\s*[|[(]|$)/i
  );

  if (!match) return [];

  return match[1]
    .split(/\s*(?:,|&|and|x)\s*/i)
    .map((name) => name.trim())
    .filter(Boolean);
}

function identifyContentType(title) {
  if (/\blive\b|\blive\s+from\b|\blive\s+performance\b/i.test(title)) {
    return CONTENT_TYPES.LIVE;
  }

  if (/\blyric\s+video\b|\bofficial\s+lyrics?\b/i.test(title)) {
    return CONTENT_TYPES.LYRIC;
  }

  if (/\bvisualizer\b|\baudio\s+visualizer\b/i.test(title)) {
    return CONTENT_TYPES.VISUALIZER;
  }

  if (/\bofficial\s+audio\b|\baudio\s+only\b/i.test(title)) {
    return CONTENT_TYPES.AUDIO;
  }

  if (/\bofficial\s+(?:music\s+)?video\b/i.test(title)) {
    return CONTENT_TYPES.OFFICIAL;
  }

  if (/\bmusic\s+video\b/i.test(title)) {
    return CONTENT_TYPES.OFFICIAL;
  }

  return CONTENT_TYPES.OTHER;
}

function normalizeSongTitle(title, artist) {
  let normalized = title.trim();

  // Remove the primary artist prefix when present.
  if (artist?.trim()) {
    const artistPattern = new RegExp(
      `^${escapeRegExp(artist.trim())}\\s*[-–—:]\\s*`,
      "i"
    );

    normalized = normalized.replace(artistPattern, "");
  }

  // Remove featured artist information.
  normalized = normalized.replace(
    /\s*\b(?:ft\.?|feat\.?|featuring)\s+.+$/i,
    ""
  );

  // Keep only the main title before pipe-separated metadata.
  normalized = normalized.split("|")[0].trim();

  // Remove descriptive parenthetical/bracketed metadata.
  normalized = normalized
    .replace(/\s*[\[(](?:official|music|lyric|audio|visualizer|video|album)[^\])]*[\])]/gi, "")
    .replace(/\s*[\[(](?:extended version|official version)[^\])]*[\])]/gi, "");

  // Remove common trailing format labels.
  normalized = normalized
    .replace(
      /\s*[-–—:]\s*(?:official\s+)?(?:music\s+)?(?:video|visualizer|audio|lyric video)$/i,
      ""
    )
    .trim();

  return normalized;
}

export function classifyCandidateTitle({ title, artist }) {
  const safeTitle = String(title || "").trim();
  const safeArtist = String(artist || "").trim();

  if (!safeTitle) {
    return {
      normalizedSongTitle: null,
      featuredArtists: [],
      contentType: CONTENT_TYPES.OTHER,
      classificationStatus: "review_required",
    };
  }

  const contentType = identifyContentType(safeTitle);
  const normalizedSongTitle = normalizeSongTitle(
    safeTitle,
    safeArtist
  );

  const featuredArtists = extractFeaturedArtists(safeTitle);

  const classificationStatus =
    normalizedSongTitle && contentType !== CONTENT_TYPES.OTHER
      ? "classified"
      : "review_required";

  return {
    normalizedSongTitle: normalizedSongTitle || null,
    featuredArtists,
    contentType,
    classificationStatus,
  };
}

export async function classifyVerseFlowCandidates({
  category = null,
  runId = null,
  limit = 100,
} = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);

  const candidates = await query(
    `
      SELECT id, title, artist
      FROM verseflow_candidates
      WHERE classification_status = 'pending'
        AND ($1::varchar IS NULL OR category = $1)
        AND ($2::uuid IS NULL OR discovered_by_run = $2)
      ORDER BY relevance_score DESC
      LIMIT $3
    `,
    [category, runId, safeLimit]
  );

  const results = {
    processed: 0,
    classified: 0,
    reviewRequired: 0,
    contentTypes: {},
    errors: [],
  };

  for (const candidate of candidates.rows) {
    try {
      const classification = classifyCandidateTitle({
        title: candidate.title,
        artist: candidate.artist,
      });

      await query(
        `
          UPDATE verseflow_candidates
          SET
            normalized_song_title = $1,
            featured_artists = $2,
            content_type = $3,
            classification_status = $4,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $5
        `,
        [
          classification.normalizedSongTitle,
          classification.featuredArtists,
          classification.contentType,
          classification.classificationStatus,
          candidate.id,
        ]
      );

      results.processed++;

      if (classification.classificationStatus === "classified") {
        results.classified++;
      } else {
        results.reviewRequired++;
      }

      results.contentTypes[classification.contentType] =
        (results.contentTypes[classification.contentType] || 0) + 1;
    } catch (error) {
      results.errors.push({
        candidateId: candidate.id,
        message: error.message,
      });
    }
  }

  return {
    success: results.errors.length === 0,
    category,
    runId,
    ...results,
  };
}
