
import { spotifyRequest } from "../services/spotify.service.js";

export async function searchSpotifyCatalog(req, res) {
  try {
    const query = req.query.q?.trim();

    if (!query || query.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Please provide a search query (maximum 100 characters).",
      });
    }

    const params = new URLSearchParams({
      q: query,
      type: "track,artist,album",
      market: "NP",
      limit: "10",
    });

    const data = await spotifyRequest(
      `/search?${params.toString()}`
    );

    const artists = (data.artists?.items || []).map((artist) => ({
      id: artist.id,
      name: artist.name,
      imageUrl: artist.images?.[0]?.url || null,
      spotifyUrl: artist.external_urls?.spotify || null,
    }));

    const tracks = (data.tracks?.items || []).map((track) => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map((artist) => ({
        id: artist.id,
        name: artist.name,
      })),
      album: track.album.name,
      imageUrl: track.album.images?.[0]?.url || null,
      durationMs: track.duration_ms,
      spotifyUrl: track.external_urls?.spotify || null,
    }));

    const albums = (data.albums?.items || []).map((album) => ({
      id: album.id,
      name: album.name,
      artists: album.artists.map((artist) => artist.name),
      imageUrl: album.images?.[0]?.url || null,
      releaseDate: album.release_date,
      spotifyUrl: album.external_urls?.spotify || null,
    }));

    return res.status(200).json({
      success: true,
      query,
      results: {
        artists,
        tracks,
        albums,
      },
    });
  } catch (error) {
    console.error("Spotify search error:", error.message);

    return res.status(502).json({
      success: false,
      message: "Unable to search Spotify right now.",
    });
  }
}
