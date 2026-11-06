
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client();

function createAuthError(message, statusCode = 401) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// ------------------------------------------
// GOOGLE TOKEN VERIFICATION
// ------------------------------------------

export async function verifyGoogleIdentity(idToken) {
  const audiences = [
    process.env.GOOGLE_WEB_CLIENT_ID,
    process.env.GOOGLE_ANDROID_CLIENT_ID,
    process.env.GOOGLE_IOS_CLIENT_ID,
  ].filter(Boolean);

  if (audiences.length === 0) {
    throw createAuthError(
      "Google authentication is not configured.",
      500
    );
  }

  let ticket;

  try {
    ticket = await googleClient.verifyIdToken({
      idToken,
      audience: audiences,
    });
  } catch {
    throw createAuthError("Invalid Google ID token.");
  }

  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email) {
    throw createAuthError("Google account information is incomplete.");
  }

  if (payload.email_verified !== true) {
    throw createAuthError("Your Google email must be verified.");
  }

  return {
    provider: "google",
    providerId: payload.sub,
    email: payload.email.toLowerCase().trim(),
    emailVerified: true,
    fullName: payload.name?.trim() || "Google User",
  };
}

// ------------------------------------------
// FACEBOOK TOKEN VERIFICATION
// ------------------------------------------

export async function verifyFacebookIdentity(accessToken) {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    throw createAuthError(
      "Facebook authentication is not configured.",
      500
    );
  }

  const appAccessToken = `${appId}|${appSecret}`;

  const debugUrl = new URL(
    "https://graph.facebook.com/v23.0/debug_token"
  );

  debugUrl.searchParams.set("input_token", accessToken);
  debugUrl.searchParams.set("access_token", appAccessToken);

  let debugData;

  try {
    const response = await fetch(debugUrl);

    debugData = await response.json();

    if (!response.ok) {
      throw new Error("Facebook token verification failed.");
    }
  } catch {
    throw createAuthError("Unable to verify Facebook credentials.");
  }

  const tokenData = debugData.data;

  if (
    !tokenData ||
    tokenData.is_valid !== true ||
    tokenData.app_id !== appId
  ) {
    throw createAuthError("Invalid Facebook access token.");
  }

  if (
    tokenData.expires_at &&
    tokenData.expires_at <= Math.floor(Date.now() / 1000)
  ) {
    throw createAuthError("Your Facebook login has expired.");
  }

  let profile;

  try {
    const profileUrl = new URL(
      "https://graph.facebook.com/v23.0/me"
    );

    profileUrl.searchParams.set("fields", "id,name,email");
    profileUrl.searchParams.set("access_token", accessToken);

    const response = await fetch(profileUrl);

    profile = await response.json();

    if (!response.ok) {
      throw new Error("Facebook profile request failed.");
    }
  } catch {
    throw createAuthError("Unable to retrieve your Facebook profile.");
  }

  if (!profile?.id) {
    throw createAuthError("Facebook account information is incomplete.");
  }

 return {
  provider: "facebook",
  providerId: profile.id,
  email: null,
  emailVerified: false,
  fullName: profile.name?.trim() || "Facebook User",
};
}
