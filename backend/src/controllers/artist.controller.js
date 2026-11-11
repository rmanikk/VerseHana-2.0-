
import { spotifyRequest } from "../services/spotify.service.js";
import { MOOD_GENRES } from "../constants/mood-genres.js";

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

    const genres = MOOD_GENRES[mood];

    // Search Spotify for each genre belonging to this mood.
    const genreResults = await Promise.all(
      genres.map(async (genre) => {
        const params = new URLSearchParams({
          q: `genre:${genre}`,
          type: "artist",
          market: "NP",
          limit: "10",
        });

        const data = await spotifyRequest(
          `/search?${params.toString()}`
        );

        return data.artists?.items || [];
      })
    );

    // Combine results and remove duplicate artists.
    const uniqueArtists = new Map();

    for (const artists of genreResults) {
      for (const artist of artists) {
        if (!uniqueArtists.has(artist.id)) {
          uniqueArtists.set(artist.id, {
            id: artist.id,
            name: artist.name,
            imageUrl: artist.images?.[0]?.url || null,
            spotifyUrl: artist.external_urls?.spotify || null,
          });
        }
      }
    }

    const artists = Array.from(uniqueArtists.values())
      .filter((artist) => artist.imageUrl)
      .slice(0, 12);

    return res.status(200).json({
      success: true,
      mood,
      artists,
    });
  } catch (error) {
    console.error("Artist spotlight error:", error.message);

    return res.status(502).json({
      success: false,
      message: "Unable to load artists right now.",
    });
  }
}
