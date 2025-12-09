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
    return NextResponse.json(
      { error: "Failed to create Google OAuth URL." },
      { status: 500 },
    );
  }
}


