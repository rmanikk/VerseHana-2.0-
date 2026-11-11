
import { searchMusicArtists } from "../services/youtube-music.service.js";
import { MOOD_GENRES } from "../constants/mood-genres.js";

const MAX_ARTISTS = 6;

// Popular artists prioritized for each mood.
const FEATURED_ARTISTS = {
  happy: [
    "Bruno Mars",
    "Dua Lipa",
    "Taylor Swift",
    "Pharrell Williams",
    "Justin Bieber",
    "Ed Sheeran",
  ],

  calm: [
    "Coldplay",
    "Billie Eilish",
    "Norah Jones",
    "Sade",
    "John Mayer",
    "Enya",
  ],

  rain: [
    "Adele",
    "Lana Del Rey",
    "Radiohead",
    "The Weeknd",
    "Cigarettes After Sex",
    "Arctic Monkeys",
  ],

  love: [
    "Ed Sheeran",
    "Ne-Yo",
    "John Legend",
    "Alicia Keys",
    "Bruno Mars",
    "Daniel Caesar",
  ],

  focus: [
    "Ludovico Einaudi",
    "Hans Zimmer",
    "Yiruma",
    "Ólafur Arnalds",
    "Max Richter",
    "Brian Eno",
  ],

  party: [
    "David Guetta",
    "Martin Garrix",
    "Calvin Harris",
    "Rihanna",
    "Pitbull",
    "The Chainsmokers",
  ],

  sad: [
    "Adele",
    "Lewis Capaldi",
    "Sam Smith",
    "Billie Eilish",
    "James Arthur",
    "Lana Del Rey",
  ],

  night: [
    "The Weeknd",
    "Sade",
    "Frank Ocean",
    "Cigarettes After Sex",
    "Joji",
    "Arctic Monkeys",
  ],
};

// Normalize names to make matching more reliable.
function normalizeArtistName(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}


async function findFeaturedArtist(name) {
  const queries = [
    `${name} official artist`,
    `${name}`,
    `${name} music`,
  ];

  const expectedName = normalizeArtistName(name);

  for (const query of queries) {
    try {
      const results = await searchMusicArtists(query, 15);

      const match = results.find(
        (artist) =>
          artist.name &&
          normalizeArtistName(artist.name) === expectedName &&
          artist.id &&
          artist.imageUrl
      );

      if (match) {
        return {
          id: match.id,
          name,
          imageUrl: match.imageUrl,
          youtubeUrl:
            match.youtubeUrl ||
            `https://music.youtube.com/channel/${match.id}`,
        };
      }
    } catch (error) {
      console.error(
        `Artist lookup failed for ${name}:`,
        error.message
      );
    }
  }

  return null;
}

export async function getArtistSpotlight(req, res) {
  try {
    const mood = req.query.mood;

    if (
      typeof mood !== "string" ||
      !Object.prototype.hasOwnProperty.call(MOOD_GENRES, mood)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid mood.",
      });
    }

    const featuredArtists = FEATURED_ARTISTS[mood];

    // Search the six prioritized artists concurrently.
    const results = await Promise.allSettled(
      featuredArtists.map((name) => findFeaturedArtist(name))
    );

    const artists = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value)
      .filter(Boolean)
      .slice(0, MAX_ARTISTS);

    return res.status(200).json({
      success: true,
      mood,
      count: artists.length,
      artists,
    });
  } catch (error) {
    console.error(
      "YouTube Music Artist Spotlight error:",
      error.message
    );

    return res.status(502).json({
      success: false,
      message: "Unable to load artists right now.",
    });
  }
}
