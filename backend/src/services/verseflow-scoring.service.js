
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

  maxResults = Math.max(1, maxResults);

  // 1. Search position: maximum 10 points.
  const position = clamp(searchPosition, 1, maxResults);

  score += Math.round(
    ((maxResults - position + 1) / maxResults) * 10
  );

  // 2. Suitable duration: maximum 10 points.
  const duration = candidate.durationSeconds;

  if (duration >= 120 && duration <= 360) {
    score += 10;
  } else if (duration >= 60 && duration <= 600) {
    score += 7;
  } else if (duration >= 30 && duration <= 900) {
    score += 4;
  }

  // 3. Metadata completeness: maximum 15 points.
  if (candidate.title?.trim()) score += 5;
  if (candidate.artist?.trim()) score += 5;
  if (candidate.album) score += 2;
  if (candidate.thumbnailUrl) score += 2;
  if (duration !== null && duration !== undefined) score += 1;

  // 4. Title quality: maximum 10 points.
  const titleLength = candidate.title?.trim().length || 0;

  if (titleLength >= 8 && titleLength <= 80) {
    score += 10;
  } else if (titleLength >= 4) {
    score += 5;
  }

  // 5. Artist metadata: maximum 5 points.
  const artistCount = candidate.artist
    ? candidate.artist.split(",").filter(Boolean).length
    : 0;

  if (artistCount === 1 || artistCount === 2) {
    score += 5;
  } else if (artistCount > 2) {
    score += 2;
  }

  // 6. Search context: maximum 10 points.
  if (task.mood && task.genre) {
    score += 10;
  } else if (task.mood || task.genre) {
    score += 5;
  }

  // Metadata alone must not make a candidate appear excellent.
  return Number(clamp(score, 0, 60).toFixed(2));
}
