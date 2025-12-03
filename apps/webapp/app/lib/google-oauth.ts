import { google } from "googleapis";

const OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/tasks.readonly",
];

type StoredTokens = {
  access_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
};

// In-memory cache for tokens within this Node process.
// This avoids extra Firebase Admin setup and is sufficient for your use case.
let cachedTokens: StoredTokens | null = null;

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Google OAuth credentials are not configured (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI).",
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

async function persistTokens(tokens: StoredTokens): Promise<void> {
  cachedTokens = {
    ...(cachedTokens ?? {}),
    ...tokens,
  };
}

async function loadTokens(): Promise<StoredTokens | null> {
  return cachedTokens;
}

export async function createOAuthUrl(): Promise<string> {
  const client = getOAuthClient();

  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: OAUTH_SCOPES,
  });

  return url;
}

export async function handleOAuthCallback(code: string): Promise<void> {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);

  await persistTokens({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    scope: tokens.scope,
    token_type: tokens.token_type,
    expiry_date: tokens.expiry_date,
  });
}

export async function getAuthorizedOAuthClient() {
  const client = getOAuthClient();
  const tokens = await loadTokens();

  if (!tokens || !tokens.refresh_token) {
    throw new Error(
      "No Google OAuth tokens found. Please connect a Google account first.",
    );
  }

  client.setCredentials(tokens);

  client.on("tokens", async (newTokens) => {
    // Persist refreshed tokens (especially new expiry_date / access_token)
    await persistTokens({
      access_token: newTokens.access_token,
      refresh_token: newTokens.refresh_token ?? tokens.refresh_token,
      expiry_date: newTokens.expiry_date,
      scope: newTokens.scope ?? tokens.scope,
      token_type: newTokens.token_type ?? tokens.token_type,
    }).catch(() => {
      // Swallow errors here – we don't want to break the request because of a failed background save
    });
  });

  return client;
}


