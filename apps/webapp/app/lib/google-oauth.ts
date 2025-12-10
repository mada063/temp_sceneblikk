import { google } from "googleapis";

const OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/tasks.readonly",
];

export type StoredTokens = {
  access_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
};

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    // Helpful logging for production debugging – does NOT log actual values
    // Only indicates which variables are present so we can diagnose misconfiguration.
    // This will appear in server logs (e.g., Amplify / CloudWatch) but is safe.
    // eslint-disable-next-line no-console
    console.error("Google OAuth env check failed", {
      hasClientId: Boolean(clientId),
      hasClientSecret: Boolean(clientSecret),
      hasRedirectUri: Boolean(redirectUri),
    });

    throw new Error(
      "Google OAuth credentials are not configured (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI).",
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export async function createOAuthUrl(forceConsent: boolean = false): Promise<string> {
  const client = getOAuthClient();

  const url = client.generateAuthUrl({
    access_type: "offline",
    // Force consent screen only if we don't have a refresh_token
    // Google only issues refresh_token on first consent, so we need to force re-consent
    // if we don't already have one stored
    prompt: forceConsent ? "consent" : "select_account",
    scope: OAUTH_SCOPES,
  });

  return url;
}

export async function handleOAuthCallback(code: string): Promise<StoredTokens> {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);

  const normalized: StoredTokens = {
    // Normalize possible null values from Google to undefined so they fit StoredTokens
    access_token: tokens.access_token ?? undefined,
    refresh_token: tokens.refresh_token ?? undefined,
    scope: tokens.scope ?? undefined,
    token_type: tokens.token_type ?? undefined,
    expiry_date: tokens.expiry_date ?? undefined,
  };

  return normalized;
}

export function getAuthorizedOAuthClient(tokens: StoredTokens) {
  const client = getOAuthClient();

  if (!tokens || !tokens.refresh_token) {
    throw new Error(
      "No Google OAuth tokens found. Please connect a Google account first.",
    );
  }

  client.setCredentials(tokens);

  // We rely on Google's internal refresh handling using the refresh_token.
  // Updated access tokens / expiry are kept per request and do not need to
  // be persisted between requests, since the refresh_token remains valid.

  return client;
}

/**
 * Serialize tokens so they can be stored in a secure HTTP-only cookie.
 * This keeps them available across serverless cold starts without
 * introducing extra infrastructure.
 */
export function serializeTokensForCookie(tokens: StoredTokens): string {
  try {
    return encodeURIComponent(JSON.stringify(tokens));
  } catch {
    return "";
  }
}

export function deserializeTokensFromCookie(
  raw: string | undefined | null,
): StoredTokens | null {
  if (!raw) return null;

  try {
    const json = decodeURIComponent(raw);
    const parsed = JSON.parse(json);
    return parsed as StoredTokens;
  } catch {
    return null;
  }
}


