import { NextRequest, NextResponse } from "next/server";
import { deserializeTokensFromCookie } from "../../../../lib/google-oauth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const tokenCookie = request.cookies.get("google_oauth_tokens")?.value;
  const tokens = deserializeTokensFromCookie(tokenCookie);

  return NextResponse.json({
    connected: Boolean(tokens?.refresh_token),
  });
}




