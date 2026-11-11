
const ARTISTS_BY_MOOD = {
  happy: [
    { id: "artist_pharrell", name: "Pharrell Williams", genre: "Pop", description: "Feel-good rhythms and uplifting music." },
    { id: "artist_dua_lipa", name: "Dua Lipa", genre: "Pop", description: "Energetic pop and dance sounds." },
    { id: "artist_bruno_mars", name: "Bruno Mars", genre: "Pop / Funk", description: "Groovy songs and catchy melodies." },
    { id: "artist_jason_mraz", name: "Jason Mraz", genre: "Pop / Acoustic", description: "Bright melodies and positive vibes." },
  ],

  calm: [
    { id: "artist_cigarettes_after_sex", name: "Cigarettes After Sex", genre: "Dream Pop", description: "Soft, atmospheric soundscapes." },
    { id: "artist_jack_johnson", name: "Jack Johnson", genre: "Acoustic", description: "Relaxed acoustic melodies." },
    { id: "artist_norah_jones", name: "Norah Jones", genre: "Jazz / Soul", description: "Gentle vocals and mellow arrangements." },
    { id: "artist_laufey", name: "Laufey", genre: "Jazz / Pop", description: "Warm, delicate musical storytelling." },
  ],

  rain: [
    { id: "artist_adele", name: "Adele", genre: "Soul / Pop", description: "Emotional vocals and heartfelt songs." },
    { id: "artist_radiohead", name: "Radiohead", genre: "Alternative", description: "Atmospheric and introspective music." },
    { id: "artist_daughter", name: "Daughter", genre: "Indie Folk", description: "Melancholic indie soundscapes." },
    { id: "artist_bon_iver", name: "Bon Iver", genre: "Indie Folk", description: "Dreamlike textures and intimate vocals." },
  ],

  night: [
    { id: "artist_the_weeknd", name: "The Weeknd", genre: "R&B / Pop", description: "Atmospheric late-night pop." },
    { id: "artist_frank_ocean", name: "Frank Ocean", genre: "Alternative R&B", description: "Intimate and atmospheric sounds." },
    { id: "artist_lana_del_rey", name: "Lana Del Rey", genre: "Alternative Pop", description: "Cinematic and dreamy melodies." },
    { id: "artist_masego", name: "Masego", genre: "R&B / Jazz", description: "Smooth rhythms and soulful grooves." },
  ],

  love: [
    { id: "artist_ed_sheeran", name: "Ed Sheeran", genre: "Pop / Acoustic", description: "Personal stories and romantic melodies." },
    { id: "artist_john_legend", name: "John Legend", genre: "R&B / Soul", description: "Soulful vocals and love songs." },
    { id: "artist_taylor_swift", name: "Taylor Swift", genre: "Pop / Folk", description: "Stories about connection and emotion." },
    { id: "artist_sza", name: "SZA", genre: "R&B", description: "Honest lyrics and expressive vocals." },
  ],

  focus: [
    { id: "artist_odesza", name: "ODESZA", genre: "Electronic", description: "Immersive instrumental electronic music." },
    { id: "artist_tycho", name: "Tycho", genre: "Ambient / Electronic", description: "Atmospheric music for concentration." },
    { id: "artist_ludovico_einaudi", name: "Ludovico Einaudi", genre: "Classical", description: "Minimal piano compositions." },
    { id: "artist_max_richter", name: "Max Richter", genre: "Neo-Classical", description: "Cinematic instrumental compositions." },
  ],

  party: [
    { id: "artist_calvin_harris", name: "Calvin Harris", genre: "Electronic / Dance", description: "High-energy dance productions." },
    { id: "artist_david_guetta", name: "David Guetta", genre: "EDM", description: "Festival-ready electronic music." },
    { id: "artist_black_eyed_peas", name: "Black Eyed Peas", genre: "Pop / Hip-Hop", description: "Upbeat tracks and big rhythms." },
    { id: "artist_doja_cat", name: "Doja Cat", genre: "Pop / Hip-Hop", description: "Playful sounds and energetic beats." },
  ],

  sad: [
    { id: "artist_joji", name: "Joji", genre: "Alternative R&B", description: "Introspective songs and soft production." },
    { id: "artist_billie_eilish", name: "Billie Eilish", genre: "Alternative Pop", description: "Atmospheric music and intimate vocals." },
    { id: "artist_lorde", name: "Lorde", genre: "Alternative Pop", description: "Thoughtful lyrics and expressive pop." },
    { id: "artist_lewis_capaldi", name: "Lewis Capaldi", genre: "Pop", description: "Emotional vocals and piano-led songs." },
  ],
};

export async function getArtistSpotlight(req, res) {
  try {
    const mood = req.query.mood;

    if (
      typeof mood !== "string" ||
      !Object.prototype.hasOwnProperty.call(ARTISTS_BY_MOOD, mood)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid mood.",
      });
    }

    return res.json({
      success: true,
      mood,
      artists: ARTISTS_BY_MOOD[mood],
    });
  } catch (error) {
    console.error("Artist spotlight error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load artists right now.",
    });
  }
}
