import { NextRequest, NextResponse } from "next/server";
import { fetchGoogleTasks } from "../../../lib/google";
import { deserializeTokensFromCookie } from "../../../lib/google-oauth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const taskListId = searchParams.get("taskListId") ?? undefined;

  try {
    const tokenCookie = request.cookies.get("google_oauth_tokens")?.value;
    const tokens = deserializeTokensFromCookie(tokenCookie);

    if (!tokens || !tokens.refresh_token) {
      return NextResponse.json(
        {
          error:
            "No Google account connected. Please connect Google in the editor first.",
        },
        { status: 401 },
      );
    }

    const { taskList, tasks } = await fetchGoogleTasks(
      {
        taskListId,
        maxResults: 100,
      },
      tokens,
    );

    return NextResponse.json({ taskList, tasks });
  } catch (error) {
    console.error("Failed to fetch Google Tasks:", error);

    // Allow client to fall back to demo data
    return NextResponse.json(
      { error: "Failed to load tasks from Google." },
      { status: 500 },
    );
  }
}


