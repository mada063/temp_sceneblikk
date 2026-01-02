import { NextRequest, NextResponse } from "next/server";
import { fetchGoogleTasks } from "../../../lib/google";
import { deserializeTokensFromCookie } from "../../../lib/google-oauth";
import { checkRateLimit, getTimeUntilNextCall } from "../../../lib/rate-limit-server";
import { getCachedTasksData, setCachedTasksData } from "../../../lib/tasks-cache";

export const runtime = "nodejs";

// Rate limit: 30 minutes (1800000 ms)
const TASKS_RATE_LIMIT_MS = 30 * 60 * 1000;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const taskListId = searchParams.get("taskListId") ?? undefined;

  // Create a unique key for rate limiting and caching based on user session
  const tokenCookie = request.cookies.get("google_oauth_tokens")?.value;
  const userIdentifier = tokenCookie?.substring(0, 20) || "anonymous";
  const rateLimitKey = `tasks_${taskListId || "default"}_${userIdentifier}`;
  const cacheKey = `tasks_${taskListId || "default"}_${userIdentifier}`;

  // Check if we have cached data first
  const cachedData = getCachedTasksData(cacheKey);
  const cacheAge = cachedData ? Date.now() - cachedData.cachedAt : Infinity;
  const isCacheStale = cacheAge >= TASKS_RATE_LIMIT_MS;
  const hasCache = cachedData !== null && !isCacheStale;

  // Check rate limit
  const isRateLimited = !checkRateLimit(rateLimitKey, TASKS_RATE_LIMIT_MS);

  if (isRateLimited) {
    // Rate limited - check if we have cached data
    if (hasCache) {
      // Return cached data with a flag indicating it's from cache
      return NextResponse.json({
        taskList: cachedData.data.taskList,
        tasks: cachedData.data.tasks,
        cached: true,
        cachedAt: cachedData.cachedAt,
      });
    }

    // No cache exists - allow first fetch to populate cache
    // This allows 1 fetch on first load even when rate limited
    // The rate limit check will still record the call, so subsequent calls will be rate limited
  }

  try {
    const tokens = deserializeTokensFromCookie(tokenCookie);

    if (!tokens || !tokens.refresh_token) {
      // Check cache even when not authenticated (might have cached data from before)
      if (cachedData) {
        return NextResponse.json({
          taskList: cachedData.data.taskList,
          tasks: cachedData.data.tasks,
          cached: true,
          cachedAt: cachedData.cachedAt,
        });
      }

      return NextResponse.json(
        {
          taskList: null,
          tasks: [],
          warning:
            "No Google account connected. Please connect Google in the editor first.",
        },
        { status: 200 },
      );
    }

    const { taskList, tasks } = await fetchGoogleTasks(
      {
        taskListId,
        maxResults: 100,
      },
      tokens,
    );

    // Store the fetched data in cache
    setCachedTasksData(cacheKey, { taskList, tasks });

    // Log for debugging
    console.log("Google Tasks API response:", {
      hasTaskList: !!taskList,
      taskListId: taskList?.id,
      taskListTitle: taskList?.title,
      tasksCount: tasks.length,
      firstTask: tasks[0]?.title,
    });

    return NextResponse.json({ taskList, tasks, cached: false });
  } catch (error) {
    console.error("Failed to fetch Google Tasks:", error);

    // On error, try to return cached data if available
    if (cachedData) {
      console.log("Returning cached data due to API error");
      return NextResponse.json({
        taskList: cachedData.data.taskList,
        tasks: cachedData.data.tasks,
        cached: true,
        cachedAt: cachedData.cachedAt,
      });
    }
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error && "code" in error ? String(error.code) : undefined;

    // Allow client to fall back to demo data
    return NextResponse.json(
      { 
        taskList: null,
        tasks: [],
        warning: "Failed to load tasks from Google.",
        details: errorMessage,
        code: errorDetails,
      },
      { status: 200 },
    );
  }
}


