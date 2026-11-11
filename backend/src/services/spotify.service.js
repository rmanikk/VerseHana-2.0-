
let cachedToken = null;
let tokenExpiresAt = 0;

export async function getSpotifyAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials are missing.");
  }

  const credentials = Buffer
    .from(`${clientId}:${clientSecret}`)
    .toString("base64");

  const response = await fetch(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error_description || "Spotify authentication failed."
    );
  }

  cachedToken = data.access_token;
  tokenExpiresAt =
    Date.now() + (data.expires_in - 60) * 1000;

  return cachedToken;
}

export async function spotifyRequest(endpoint) {
  const token = await getSpotifyAccessToken();

  const response = await fetch(
    `https://api.spotify.com/v1${endpoint}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const responseText = await response.text();

  console.log("Spotify API status:", response.status);
  console.log(
    "Spotify API content type:",
    response.headers.get("content-type")
  );
  console.log(
    "Spotify API response:",
    responseText.slice(0, 500)
  );

  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Spotify returned a non-JSON response: ${responseText.slice(0, 300)}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Spotify API request failed."
    );
  }

  return data;
}
