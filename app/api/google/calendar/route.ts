import { NextRequest, NextResponse } from "next/server";
import { fetchGoogleCalendarEvents } from "../../../lib/google";
import { deserializeTokensFromCookie } from "../../../lib/google-oauth";
import { checkRateLimit, getTimeUntilNextCall } from "../../../lib/rate-limit-server";
import { getCachedCalendarData, setCachedCalendarData } from "../../../lib/calendar-cache";

export const runtime = "nodejs";

// Rate limit: 1 hour (3600000 ms)
const CALENDAR_RATE_LIMIT_MS = 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const yearParam = searchParams.get("year");
  const monthParam = searchParams.get("month");
  const calendarId = searchParams.get("calendarId") ?? undefined;

  const now = new Date();
  const year = Number.isFinite(Number(yearParam))
    ? Number(yearParam)
    : now.getFullYear();
  const month = Number.isFinite(Number(monthParam))
    ? Number(monthParam)
    : now.getMonth();

  // Create a unique key for rate limiting and caching based on user session
  // Use a combination of calendar ID, year, month, and user identifier
  const tokenCookie = request.cookies.get("google_oauth_tokens")?.value;
  const userIdentifier = tokenCookie?.substring(0, 20) || "anonymous";
  const rateLimitKey = `calendar_${calendarId || "default"}_${userIdentifier}`;
  const cacheKey = `calendar_${calendarId || "default"}_${year}_${month}_${userIdentifier}`;

  // Check if we have cached data first
  const cachedData = getCachedCalendarData(cacheKey);
  const cacheAge = cachedData ? Date.now() - cachedData.cachedAt : Infinity;
  const isCacheStale = cacheAge >= CALENDAR_RATE_LIMIT_MS;
  const hasCache = cachedData !== null && !isCacheStale;

  // Check rate limit
  const isRateLimited = !checkRateLimit(rateLimitKey, CALENDAR_RATE_LIMIT_MS);

  if (isRateLimited) {
    // Rate limited - check if we have cached data
    if (hasCache) {
      // Return cached data with a flag indicating it's from cache
      return NextResponse.json({
        events: cachedData.data.events,
        cached: true,
        cachedAt: cachedData.cachedAt,
      });
    }

    // No cache exists - allow first fetch to populate cache
    // This allows 1 fetch on first load even when rate limited
    // The rate limit check will still record the call, so subsequent calls will be rate limited
  }

  // Not rate limited - fetch fresh data
  // Use month boundaries as time window
  const timeMin = new Date(Date.UTC(year, month, 1, 0, 0, 0)).toISOString();
  const timeMax = new Date(
    Date.UTC(year, month + 1, 0, 23, 59, 59),
  ).toISOString();

  try {
    const tokens = deserializeTokensFromCookie(tokenCookie);

    if (!tokens || !tokens.refresh_token) {
      // Check cache even when not authenticated (might have cached data from before)
      const cachedData = getCachedCalendarData(cacheKey);
      if (cachedData) {
        return NextResponse.json({
          events: cachedData.data.events,
          cached: true,
          cachedAt: cachedData.cachedAt,
        });
      }

      return NextResponse.json(
        {
          events: [],
          warning:
            "No Google account connected. Please connect Google in the editor first.",
        },
        { status: 200 },
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

    // Store the fetched data in cache
    setCachedCalendarData(cacheKey, { events });

    return NextResponse.json({ events, cached: false });
  } catch (error) {
    console.error("Failed to fetch Google Calendar events:", error);

    // On error, try to return cached data if available
    const cachedData = getCachedCalendarData(cacheKey);
    if (cachedData) {
      console.log("Returning cached data due to API error");
      return NextResponse.json({
        events: cachedData.data.events,
        cached: true,
        cachedAt: cachedData.cachedAt,
      });
    }

    // When credentials are missing or API fails, return a warning so the client can fall back
    return NextResponse.json(
      { 
        events: [],
        warning: "Failed to load calendar events from Google.",
      },
      { status: 200 },
    );
  }
}


