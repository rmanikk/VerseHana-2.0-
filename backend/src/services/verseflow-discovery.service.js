
import { getChannelVideos } from "./youtube-music.service.js";
import { getArtistChannels } from "./verseflow-artist-channel.service.js";
import { query } from "../config/database.js";
import { calculateRelevanceScore } from "./verseflow-scoring.service.js";

const SOURCE_NAME = "youtube_music";

const VALID_CATEGORIES = ["global", "nepali", "hindi"];

const MAX_VIDEOS_PER_CHANNEL = 30;

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
  /\bjukebox\b/i,
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
  /\bmusic collection\b/i,
  /\bbest songs of\b/i,
  /\btop songs of\b/i,
  /\bsong reaction\b/i,
  /\bmusic reaction\b/i,
  /\bmusic review\b/i,
  /\bkaraoke version\b/i,
];

const GENERIC_ARTIST_PATTERNS = [
  /\bmusic channel\b/i,
  /\bradio\b/i,
  /\brelaxation\b/i,
  /\bplaylist\b/i,
  /\bmixes\b/i,
  /\binstrumental music\b/i,
  /\bmusic for\b/i,
  /\bsleep music\b/i,
  /\bmeditation music\b/i,
  /\bsound effects\b/i,
];

function checkTrackQuality(candidate) {
  const title = candidate.title?.trim() || "";
  const artist = candidate.artist?.trim() || "";
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
      reason: "compilation_or_non_song_content",
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

function normalizeVideo(video, artistChannel) {
  if (!video?.id || !video?.title) {
    return null;
  }

  return {
    sourceName: SOURCE_NAME,
    sourceItemId: video.id,
    sourceUrl: video.url ||
      `https://www.youtube.com/watch?v=${video.id}`,

    title: video.title.trim(),

    // Use the artist name registered by the administrator.
    artist: artistChannel.artist_name,

    album: null,
    thumbnailUrl: video.thumbnail || null,
    durationSeconds: video.durationSeconds ?? null,

    // Preserve the channel's configured language.
    languageCode: artistChannel.language_code || null,

    // Category comes from the registered artist channel.
    category: artistChannel.category,

    // We will classify mood and genre in a later stage.
    moods: [],
    genres: [],

    popularityScore: 0,
    trendScore: 0,

    rightsStatus: "unknown",
    discoveryStatus: "discovered",

    sourceArtistChannelId: artistChannel.id,

    rawMetadata: {
      source: "youtube_artist_channel",
      channelId: artistChannel.channel_id,
      channelName: artistChannel.artist_name,
      channelUrl: artistChannel.channel_url,
      videoId: video.id,
      videoTitle: video.title,
      category: artistChannel.category,
      languageCode: artistChannel.language_code || null,
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
        discovered_by_run,
        source_artist_channel_id
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11::jsonb, $12::jsonb,
        $13, $14, $15, $16, $17, $18::jsonb,
        $19, $20
      )
      ON CONFLICT (source_name, source_item_id)
      DO UPDATE SET
        relevance_score = GREATEST(
          verseflow_candidates.relevance_score,
          EXCLUDED.relevance_score
        ),

        category = EXCLUDED.category,

        source_artist_channel_id = COALESCE(
          verseflow_candidates.source_artist_channel_id,
          EXCLUDED.source_artist_channel_id
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

        raw_metadata =
          verseflow_candidates.raw_metadata ||
          EXCLUDED.raw_metadata,

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
      candidate.sourceArtistChannelId,
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

  let scannedChannels = 0;
  let searchedQueries = 0;
  let discoveredTracks = 0;
  let savedCandidates = 0;
  let duplicateCandidates = 0;
  let filteredCandidates = 0;

  const filterReasons = {};
  const channelErrors = [];

  try {
    const artistChannels = await getArtistChannels({
      category,
      verificationStatus: "verified",
      activeOnly: true,
    });

    for (const artistChannel of artistChannels) {
      scannedChannels++;

      try {
        const videos = await getChannelVideos(
          artistChannel.channel_id,
          MAX_VIDEOS_PER_CHANNEL
        );

        // Keep the existing result field for compatibility.
        searchedQueries++;

        for (
          let index = 0;
          index < videos.length;
          index++
        ) {
          const video = videos[index];

          const candidate = normalizeVideo(
            video,
            artistChannel
          );

          if (!candidate) {
            filteredCandidates++;

            filterReasons.missing_metadata =
              (filterReasons.missing_metadata || 0) + 1;

            continue;
          }

          discoveredTracks++;

          candidate.relevanceScore =
            calculateRelevanceScore(candidate, {
              searchPosition: index + 1,
              maxResults: Math.max(1, videos.length),
              task: {},
            });

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
      } catch (error) {
        channelErrors.push({
          artist: artistChannel.artist_name,
          channelId: artistChannel.channel_id,
          message: error.message,
        });
      }
    }

    const summary = {
      category,
      scannedChannels,
      searchedQueries,
      discoveredTracks,
      savedCandidates,
      duplicateCandidates,
      filteredCandidates,
      filterReasons,
      channelErrors,
      discoverySource: "verified_artist_channels",
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
