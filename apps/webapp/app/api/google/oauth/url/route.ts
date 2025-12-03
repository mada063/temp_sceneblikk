import { NextResponse } from "next/server";
import { createOAuthUrl } from "../../../../lib/google-oauth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const url = await createOAuthUrl();
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Failed to create Google OAuth URL:", error);
    return NextResponse.json(
      { error: "Failed to create Google OAuth URL." },
      { status: 500 },
    );
  }
}


