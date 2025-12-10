import { NextResponse } from "next/server";
import { createOAuthUrl } from "../../../../lib/google-oauth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const url = await createOAuthUrl();
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


