
import { getMusicClient } from "./youtube-music.service.js";
import { MOOD_GENRES } from "../constants/mood-genres.js";
import { query } from "../config/database.js";
import { calculateRelevanceScore } from "./verseflow-scoring.service.js";

const SOURCE_NAME = "youtube_music";

const VALID_CATEGORIES = ["global", "nepali", "hindi"];

const MAX_QUERIES_PER_RUN = 12;
const MAX_RESULTS_PER_QUERY = 8;

function getText(value) {
  if (typeof value === "string") return value;
  if (typeof value?.text === "string") return value.text;
  return "";
}

function getTrackArtists(track) {
  if (!Array.isArray(track.artists)) return [];

  return track.artists
    .map((artist) => getText(artist.name || artist))
    .filter(Boolean);
}

function getTrackThumbnail(track) {
  const thumbnails = track.thumbnails || [];

  const thumbnail = thumbnails.find((item) => item?.url);

  return thumbnail?.url || null;
}

function getTrackDuration(track) {
  const duration = track.duration;

  if (typeof duration?.seconds === "number") {
    return Math.floor(duration.seconds);
  }

  if (typeof track.duration_seconds === "number") {
    return Math.floor(track.duration_seconds);
  }

  return null;
}


const MAX_TRACK_DURATION_SECONDS = 15 * 60;
const MIN_TRACK_DURATION_SECONDS = 30;

const LOW_QUALITY_TITLE_PATTERNS = [
  /\bfull album\b/i,
  /\bcomplete album\b/i,
  /\balbum mix\b/i,
  /\bcompilation\b/i,
  /\bplaylist\b/i,
  /\bnon.?stop mix\b/i,
  /\bcontinuous mix\b/i,
  /\bmega mix\b/i,
  /\b1\s*hour\b/i,
  /\b2\s*hours?\b/i,
  /\b3\s*hours?\b/i,
  /\bhour long\b/i,
  /\bbackground music\b/i,
  /\bmusic for studying\b/i,
  /\bmusic for sleeping\b/i,
  /\brelaxing music\b/i,
  /\blofi radio\b/i,
  /\bambient sounds\b/i,
  /\bsoundscape\b/i,
];

const GENERIC_ARTIST_PATTERNS = [
  /\bmusic channel\b/i,
  /\bradio\b/i,
  /\brelaxation\b/i,
  /\bplaylist\b/i,
  /\bmixes\b/i,
  /\binstrumental music\b/i,
  /\bmusic for\b/i,
];

function checkTrackQuality(candidate) {
  const title = candidate.title.trim();
  const artist = candidate.artist.trim();
  const duration = candidate.durationSeconds;

  if (!title || !artist) {
    return {
      accepted: false,
      reason: "missing_metadata",
    };
  }

  if (
    LOW_QUALITY_TITLE_PATTERNS.some((pattern) =>
      pattern.test(title)
    )
  ) {
    return {
      accepted: false,
      reason: "compilation_or_background_mix",
    };
  }

  if (
    GENERIC_ARTIST_PATTERNS.some((pattern) =>
      pattern.test(artist)
    )
  ) {
    return {
      accepted: false,
      reason: "generic_artist_name",
    };
  }

  if (
    duration !== null &&
    (
      duration < MIN_TRACK_DURATION_SECONDS ||
      duration > MAX_TRACK_DURATION_SECONDS
    )
  ) {
    return {
      accepted: false,
      reason: "duration_out_of_range",
    };
  }

  return {
    accepted: true,
    reason: null,
  };
}


// Generate category-specific mood and genre searches.
function buildSearchQuery(category, mood, genre) {
  if (category === "nepali") {
    return `Nepali ${mood} ${genre} songs`;
  }

  if (category === "hindi") {
    return `Hindi ${mood} ${genre} songs`;
  }

  return `${mood} ${genre} music`;
}

// Distribute searches across all moods before repeating moods.
function buildSearchTasks(category) {
  const moodEntries = Object.entries(MOOD_GENRES);
  const tasks = [];

  const maxGenres = Math.max(
    ...moodEntries.map(([, genres]) => genres.length)
  );

  for (let genreIndex = 0; genreIndex < maxGenres; genreIndex++) {
    for (const [mood, genres] of moodEntries) {
      const genre = genres[genreIndex];

      if (!genre) continue;

      tasks.push({
        mood,
        genre,
        searchQuery: buildSearchQuery(
          category,
          mood,
          genre
        ),
      });

      if (tasks.length >= MAX_QUERIES_PER_RUN) {
        return tasks;
      }
    }
  }

  return tasks;
}

function normalizeTrack(track, task, category) {
  const id = track.id;
  const title = getText(track.title);
  const artists = getTrackArtists(track);

  if (!id || !title || artists.length === 0) {
    return null;
  }

  return {
    sourceName: SOURCE_NAME,
    sourceItemId: id,
    sourceUrl: `https://music.youtube.com/watch?v=${id}`,
    title,
    artist: artists.join(", "),
    album: getText(track.album?.name || track.album) || null,
    thumbnailUrl: getTrackThumbnail(track),
    durationSeconds: getTrackDuration(track),

    languageCode:
      category === "nepali"
        ? "ne"
        : category === "hindi"
          ? "hi"
          : null,

    category,
    moods: [task.mood],
    genres: [task.genre],
    popularityScore: 0,
    trendScore: 0,
    rightsStatus: "unknown",
    discoveryStatus: "discovered",

    rawMetadata: {
      searchQuery: task.searchQuery,
      source: SOURCE_NAME,
      trackId: id,
    },
  };
}


async function saveCandidate(candidate, runId) {
  const result = await query(
    `
      INSERT INTO verseflow_candidates (
        source_name,
        source_item_id,
        source_url,
        title,
        artist,
        album,
        thumbnail_url,
        duration_seconds,
        language_code,
        category,
        moods,
        genres,
        popularity_score,
        trend_score,
        relevance_score,
        rights_status,
        discovery_status,
        raw_metadata,
        discovered_by_run
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11::jsonb, $12::jsonb,
        $13, $14, $15, $16, $17, $18::jsonb, $19
      )
      ON CONFLICT (source_name, source_item_id)
      DO UPDATE SET
      relevance_score = GREATEST(
  verseflow_candidates.relevance_score,
  EXCLUDED.relevance_score
),
        moods = (
          SELECT COALESCE(
            jsonb_agg(DISTINCT value),
            '[]'::jsonb
          )
          FROM jsonb_array_elements(
            verseflow_candidates.moods || EXCLUDED.moods
          ) AS mood(value)
        ),
        genres = (
          SELECT COALESCE(
            jsonb_agg(DISTINCT value),
            '[]'::jsonb
          )
          FROM jsonb_array_elements(
            verseflow_candidates.genres || EXCLUDED.genres
          ) AS genre(value)
        ),
        updated_at = CURRENT_TIMESTAMP
      RETURNING (xmax = 0) AS inserted
    `,
    [
      candidate.sourceName,
      candidate.sourceItemId,
      candidate.sourceUrl,
      candidate.title,
      candidate.artist,
      candidate.album,
      candidate.thumbnailUrl,
      candidate.durationSeconds,
      candidate.languageCode,
      candidate.category,
      JSON.stringify(candidate.moods),
      JSON.stringify(candidate.genres),
      candidate.popularityScore,
      candidate.trendScore,
      candidate.relevanceScore,
      candidate.rightsStatus,
      candidate.discoveryStatus,
      JSON.stringify(candidate.rawMetadata),
      runId,
    ]
  );

  return result.rows[0]?.inserted === true;
}

export async function discoverVerseFlowCandidates({
  category = "global",
  triggerType = "manual",
  startedBy = null,
} = {}) {
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error(`Invalid VerseFlow category: ${category}`);
  }

  if (!["manual", "scheduled"].includes(triggerType)) {
    throw new Error("Invalid discovery trigger type.");
  }

  const runResult = await query(
    `
      INSERT INTO verseflow_bot_runs (
        run_type,
        category,
        status,
        trigger_type,
        started_by
      )
      VALUES ('discovery', $1, 'running', $2, $3)
      RETURNING id
    `,
    [category, triggerType, startedBy]
  );

  const runId = runResult.rows[0].id;

let searchedQueries = 0;
let discoveredTracks = 0;
let savedCandidates = 0;
let duplicateCandidates = 0;
let filteredCandidates = 0;

const filterReasons = {};

  try {
    const music = await getMusicClient();
    const tasks = buildSearchTasks(category);

    for (const task of tasks) {
      searchedQueries++;

      const results = await music.search(task.searchQuery, {
        type: "song",
      });

      const tracks = results.songs?.contents || [];

      const selectedTracks = tracks.slice(
  0,
  MAX_RESULTS_PER_QUERY
);

for (let index = 0; index < selectedTracks.length; index++) {
  const track = selectedTracks[index];

        const candidate = normalizeTrack(
  track,
  task,
  category
);

if (!candidate) continue;

candidate.relevanceScore = calculateRelevanceScore(
  candidate,
  {
    searchPosition: index + 1,
    maxResults: selectedTracks.length,
    task,
  }
);

discoveredTracks++;

const quality = checkTrackQuality(candidate);

if (!quality.accepted) {
  filteredCandidates++;

  filterReasons[quality.reason] =
    (filterReasons[quality.reason] || 0) + 1;

  continue;
}

const saved = await saveCandidate(candidate, runId);

        if (saved) {
          savedCandidates++;
        } else {
          duplicateCandidates++;
        }
      }
    }

    const summary = {
  category,
  searchedQueries,
  discoveredTracks,
  savedCandidates,
  duplicateCandidates,
  filteredCandidates,
  filterReasons,
};

    await query(
      `
        UPDATE verseflow_bot_runs
        SET
          status = 'completed',
          results = $1::jsonb,
          completed_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `,
      [JSON.stringify(summary), runId]
    );

    return {
      success: true,
      runId,
      ...summary,
    };
  } catch (error) {
    await query(
      `
        UPDATE verseflow_bot_runs
        SET
          status = 'failed',
          error_message = $1,
          completed_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `,
      [error.message, runId]
    );

    throw error;
  }
}
