import { NextRequest, NextResponse } from "next/server";
import { fetchGoogleCalendarEvents } from "../../../lib/google";
import { deserializeTokensFromCookie } from "../../../lib/google-oauth";
import { checkRateLimit, getTimeUntilNextCall } from "../../../lib/rate-limit-server";

export const runtime = "nodejs";

// Rate limit: 1 hour (3600000 ms)
const CALENDAR_RATE_LIMIT_MS = 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const yearParam = searchParams.get("year");
  const monthParam = searchParams.get("month");
  const calendarId = searchParams.get("calendarId") ?? undefined;

  // Create a unique key for rate limiting based on user session
  // Use a combination of calendar ID and user identifier if available
  const tokenCookie = request.cookies.get("google_oauth_tokens")?.value;
  const rateLimitKey = `calendar_${calendarId || "default"}_${tokenCookie?.substring(0, 20) || "anonymous"}`;

  // Check rate limit
  if (!checkRateLimit(rateLimitKey, CALENDAR_RATE_LIMIT_MS)) {
    const timeRemaining = getTimeUntilNextCall(rateLimitKey, CALENDAR_RATE_LIMIT_MS);
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

  const now = new Date();
  const year = Number.isFinite(Number(yearParam))
    ? Number(yearParam)
    : now.getFullYear();
  const month = Number.isFinite(Number(monthParam))
    ? Number(monthParam)
    : now.getMonth();

  // Use month boundaries as time window
  const timeMin = new Date(Date.UTC(year, month, 1, 0, 0, 0)).toISOString();
  const timeMax = new Date(
    Date.UTC(year, month + 1, 0, 23, 59, 59),
  ).toISOString();

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

    const events = await fetchGoogleCalendarEvents(
      {
        calendarId,
        timeMin,
        timeMax,
        maxResults: 200,
      },
      tokens,
    );

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Failed to fetch Google Calendar events:", error);

    // When credentials are missing or API fails, return a friendly error so the client can fall back
    return NextResponse.json(
      { error: "Failed to load calendar events from Google." },
      { status: 500 },
    );
  }
}


