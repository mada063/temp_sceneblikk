import { NextRequest, NextResponse } from "next/server";
import { handleOAuthCallback } from "../../../../lib/google-oauth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(new URL("/editor?google=error", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/editor?google=missing_code", request.url));
  }

  try {
    await handleOAuthCallback(code);
    return NextResponse.redirect(new URL("/editor?google=connected", request.url));
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Failed to handle Google OAuth callback:", errorMessage, err);
    return NextResponse.redirect(new URL("/editor?google=error", request.url));
  }
}


