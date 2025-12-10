import { NextRequest, NextResponse } from "next/server";
import { fetchGoogleTasks } from "../../../lib/google";
import { deserializeTokensFromCookie } from "../../../lib/google-oauth";
import { checkRateLimit, getTimeUntilNextCall } from "../../../lib/rate-limit-server";

export const runtime = "nodejs";

// Rate limit: 30 minutes (1800000 ms)
const TASKS_RATE_LIMIT_MS = 30 * 60 * 1000;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const taskListId = searchParams.get("taskListId") ?? undefined;

  // Create a unique key for rate limiting based on user session
  const tokenCookie = request.cookies.get("google_oauth_tokens")?.value;
  const rateLimitKey = `tasks_${taskListId || "default"}_${tokenCookie?.substring(0, 20) || "anonymous"}`;

  // Check rate limit
  if (!checkRateLimit(rateLimitKey, TASKS_RATE_LIMIT_MS)) {
    const timeRemaining = getTimeUntilNextCall(rateLimitKey, TASKS_RATE_LIMIT_MS);
    const minutesRemaining = Math.ceil(timeRemaining / (60 * 1000));
    return NextResponse.json(
      {
        error: `Rate limit exceeded. Please wait ${minutesRemaining} minute(s) before making another request.`,
        rateLimited: true,
        retryAfter: timeRemaining,
      },
      { status: 429 },
    );
  }

  try {
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

    // Log for debugging
    console.log("Google Tasks API response:", {
      hasTaskList: !!taskList,
      taskListId: taskList?.id,
      taskListTitle: taskList?.title,
      tasksCount: tasks.length,
      firstTask: tasks[0]?.title,
    });

    return NextResponse.json({ taskList, tasks });
  } catch (error) {
    console.error("Failed to fetch Google Tasks:", error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error && "code" in error ? String(error.code) : undefined;

    // Allow client to fall back to demo data
    return NextResponse.json(
      { 
        error: "Failed to load tasks from Google.",
        details: errorMessage,
        code: errorDetails,
      },
      { status: 500 },
    );
  }
}


