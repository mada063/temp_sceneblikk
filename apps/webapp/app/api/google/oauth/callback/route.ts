import { NextRequest, NextResponse } from "next/server";
import {
  handleOAuthCallback,
  serializeTokensForCookie,
} from "../../../../lib/google-oauth";

export const runtime = "nodejs";

// Persist Google OAuth tokens into a secure HTTP-only cookie so the user
// only has to connect their Google account once per browser.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  if (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(`${appBaseUrl}/editor?google=error`);
  }

  if (!code) {
    return NextResponse.redirect(
      `${appBaseUrl}/editor?google=missing_code`,
    );
  }

  try {
    const tokens = await handleOAuthCallback(code);

    // Log token status for debugging (without exposing actual token values)
    console.log("OAuth callback tokens received:", {
      hasAccessToken: Boolean(tokens.access_token),
      hasRefreshToken: Boolean(tokens.refresh_token),
      hasScope: Boolean(tokens.scope),
      expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
    });

    if (!tokens.refresh_token) {
      console.error("WARNING: No refresh_token received from Google OAuth. This will cause 401 errors.");
      console.error("This usually happens if consent was already granted. Using prompt=consent should fix this.");
    }

    const response = NextResponse.redirect(
      `${appBaseUrl}/editor?google=connected`,
    );

    const serialized = serializeTokensForCookie(tokens);
    if (serialized) {
      response.cookies.set("google_oauth_tokens", serialized, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        // Keep for a long time; refresh_token will be used to keep access fresh.
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    } else {
      console.error("Failed to serialize tokens for cookie");
    }

    return response;
  } catch (err) {
    console.error("Failed to handle Google OAuth callback:", err);
    return NextResponse.redirect(`${appBaseUrl}/editor?google=error`);
  }
}


