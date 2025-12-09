import { NextRequest, NextResponse } from "next/server";
import { handleOAuthCallback } from "../../../../lib/google-oauth";

export const runtime = "nodejs";

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
    await handleOAuthCallback(code);
    return NextResponse.redirect(`${appBaseUrl}/editor?google=connected`);
  } catch (err) {
    console.error("Failed to handle Google OAuth callback:", err);
    return NextResponse.redirect(`${appBaseUrl}/editor?google=error`);
  }
}


