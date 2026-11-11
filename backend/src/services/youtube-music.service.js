
import { Innertube } from "youtubei.js";

let musicClient = null;
let clientPromise = null;

const GENERIC_ARTIST_NAME_PATTERNS = [
  /\bradio\b/i,
  /\brelaxation\b/i,
  /\brelaxing\b/i,
  /\bacademy\b/i,
  /\balbums\b/i,
  /\bnetwork\b/i,
  /\bcorner\b/i,
  /\bsongs\b/i,
  /\binstrumental music\b/i,
  /\bmusic for\b/i,
  /\bplaylist\b/i,
  /\bvibes\b/i,
  /\bmixes\b/i,
  /\bmusic channel\b/i,
  /\bsaxophone songs\b/i,
  /\berotic\b/i,
  /\bsensual\b/i,
];

async function getMusicClient() {
  if (musicClient) return musicClient;

  if (!clientPromise) {
    clientPromise = Innertube.create({
      location: "NP",
      lang: "en",
    });
  }

  try {
    const youtube = await clientPromise;
    musicClient = youtube.music;
    return musicClient;
  } catch (error) {
    clientPromise = null;
    throw error;
  }
}

function normalizeName(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getArtistName(artist) {
  return (
    artist.name ||
    artist.title ||
    ""
  ).trim();
}

function getArtistImage(artist) {
  const thumbnails = artist.thumbnails || [];

  const thumbnail = thumbnails.find(
    (item) => item?.url
  );

  return thumbnail?.url || null;
}

function isLikelyArtist(artist) {
  const name = getArtistName(artist);
  const category = artist.subtitle?.text || "";
  const imageUrl = getArtistImage(artist);

  if (!artist.id || !name || !imageUrl) {
    return false;
  }

  if (artist.item_type !== "artist") {
    return false;
  }

  if (!/^Artist\b/i.test(category)) {
    return false;
  }

  if (
    GENERIC_ARTIST_NAME_PATTERNS.some((pattern) =>
      pattern.test(name)
    )
  ) {
    return false;
  }

  return true;
}

export async function searchMusicArtists(query, limit = 12) {
  if (!query || typeof query !== "string") {
    throw new Error("A search query is required.");
  }

  const safeLimit = Math.min(
    30,
    Math.max(1, Math.floor(Number(limit) || 12))
  );

  const music = await getMusicClient();

  const results = await music.search(query, {
    type: "artist",
  });

  const artists = results.artists?.contents || [];
  const uniqueArtists = new Map();

  for (const artist of artists) {
    if (!isLikelyArtist(artist)) {
      continue;
    }

    const name = getArtistName(artist);
    const normalizedName = normalizeName(name);

    if (uniqueArtists.has(normalizedName)) {
      continue;
    }

    uniqueArtists.set(normalizedName, {
      id: artist.id,
      name,
      imageUrl: getArtistImage(artist),
      youtubeUrl: `https://music.youtube.com/channel/${artist.id}`,
    });

    if (uniqueArtists.size >= safeLimit) {
      break;
    }
  }

  return Array.from(uniqueArtists.values());
}
