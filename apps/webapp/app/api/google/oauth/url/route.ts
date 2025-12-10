import { NextRequest, NextResponse } from "next/server";
import { createOAuthUrl, deserializeTokensFromCookie } from "../../../../lib/google-oauth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // Check if we already have tokens with a refresh_token in cookies
    const tokenCookie = request.cookies.get("google_oauth_tokens")?.value;
    const existingTokens = deserializeTokensFromCookie(tokenCookie);
    
    // Only force consent if we don't have a refresh_token
    // If we have one, just use select_account to let user choose account
    const forceConsent = !existingTokens?.refresh_token;
    
    const url = await createOAuthUrl(forceConsent);
    return NextResponse.json({ url });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to create Google OAuth URL:", errorMessage, error);
    
    // Log environment variable status for debugging (without exposing values)
    console.error("Environment check:", {
      hasClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
      hasClientSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
      hasRedirectUri: Boolean(process.env.GOOGLE_REDIRECT_URI),
      redirectUri: process.env.GOOGLE_REDIRECT_URI ? "set" : "missing",
    });
    
    return NextResponse.json(
      { 
        error: "Failed to create Google OAuth URL.",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}


