
const MAX_SCORE = 100;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function calculateRelevanceScore(
  candidate,
  {
    searchPosition = 1,
    maxResults = 8,
    task = {},
  } = {}
) {
  let score = 0;

  // Prevent division by zero.
  maxResults = Math.max(1, maxResults);

  // 1. Search position: maximum 20 points.
  const position = clamp(searchPosition, 1, maxResults);

  score += Math.round(
    ((maxResults - position + 1) / maxResults) * 20
  );

  // 2. Duration suitability: maximum 20 points.
  const duration = candidate.durationSeconds;

  if (duration === null || duration === undefined) {
    score += 8;
  } else if (duration >= 120 && duration <= 360) {
    score += 20;
  } else if (duration >= 60 && duration <= 600) {
    score += 16;
  } else if (duration >= 30 && duration <= 900) {
    score += 10;
  }

  // 3. Metadata completeness: maximum 25 points.
  if (candidate.title?.trim()) score += 8;
  if (candidate.artist?.trim()) score += 8;
  if (candidate.album) score += 3;
  if (candidate.thumbnailUrl) score += 3;

  if (duration !== null && duration !== undefined) {
    score += 3;
  }

  // 4. Title quality: maximum 10 points.
  const titleLength = candidate.title?.trim().length || 0;

  if (titleLength >= 8 && titleLength <= 80) {
    score += 10;
  } else if (titleLength >= 4) {
    score += 6;
  }

  // 5. Artist metadata quality: maximum 10 points.
  const artistCount = candidate.artist
    ? candidate.artist.split(",").filter(Boolean).length
    : 0;

  if (artistCount === 1 || artistCount === 2) {
    score += 10;
  } else if (artistCount > 2) {
    score += 5;
  }

  // 6. Discovery context: maximum 15 points.
  if (task.mood && task.genre) {
    score += 15;
  } else if (task.mood || task.genre) {
    score += 8;
  }

  return Number(clamp(score, 0, MAX_SCORE).toFixed(2));
}
