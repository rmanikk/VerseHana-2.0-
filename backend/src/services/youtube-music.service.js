
import { Innertube } from "youtubei.js";

let youtubeClient = null;
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

async function getYouTubeClient() {
  if (youtubeClient) return youtubeClient;

  if (!clientPromise) {
    clientPromise = Innertube.create({
      location: "NP",
      lang: "en",
    });
  }

  try {
    youtubeClient = await clientPromise;
    return youtubeClient;
  } catch (error) {
    clientPromise = null;
    throw error;
  }
}

export async function getMusicClient() {
  if (musicClient) return musicClient;

  const youtube = await getYouTubeClient();

  musicClient = youtube.music;

  return musicClient;
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

// Resolve a YouTube channel URL into its actual channel ID.
export async function resolveYouTubeChannel(channelUrl) {
  if (
    typeof channelUrl !== "string" ||
    !channelUrl.trim()
  ) {
    throw new Error("A YouTube channel URL is required.");
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(channelUrl.trim());
  } catch {
    throw new Error("Invalid YouTube channel URL.");
  }

  const allowedHosts = [
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "music.youtube.com",
  ];

  if (
    parsedUrl.protocol !== "https:" ||
    !allowedHosts.includes(parsedUrl.hostname)
  ) {
    throw new Error("Please provide a valid YouTube channel URL.");
  }

  const pathParts = parsedUrl.pathname
    .split("/")
    .filter(Boolean);

  if (!pathParts.length) {
    throw new Error("The URL does not identify a channel.");
  }

  const youtube = await getYouTubeClient();

  let channelId = null;

  // Direct channel ID URL.
  if (pathParts[0] === "channel" && pathParts[1]) {
    channelId = pathParts[1];
  } else if (
    pathParts[0].startsWith("@") ||
    ["c", "user"].includes(pathParts[0])
  ) {
    // Resolve handle, custom URL, or legacy username URL.
    const endpoint = await youtube.resolveURL(
      parsedUrl.toString()
    );

    channelId =
      endpoint.payload?.browseId ||
      endpoint.payload?.browseEndpoint?.browseId ||
      null;
  } else {
    throw new Error(
      "Supported links are /channel/ID, /@handle, /c/name and /user/name."
    );
  }

  if (
    typeof channelId !== "string" ||
    !/^UC[\w-]{22}$/.test(channelId)
  ) {
    throw new Error(
      "YouTube could not resolve this link to a valid channel ID."
    );
  }

  const channel = await youtube.getChannel(channelId);

  const verifiedChannelId =
    channel.metadata?.external_id;

  if (verifiedChannelId !== channelId) {
    throw new Error(
      "The resolved channel could not be verified."
    );
  }

  const channelName =
    channel.metadata?.title ||
    channel.title ||
    null;

  if (!channelName) {
    throw new Error(
      "Unable to retrieve the channel name."
    );
  }

  return {
    channelId,
    channelName,
    channelUrl:
      channel.metadata?.url_canonical ||
      `https://www.youtube.com/channel/${channelId}`,
  };
}
