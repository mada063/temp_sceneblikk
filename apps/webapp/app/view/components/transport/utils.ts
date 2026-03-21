import type { TransportData, Departure, StopPlace } from "./types";
import { checkRateLimit, getTimeUntilNextCall } from "../../../lib/rate-limit-client";

const ENTUR_API_URL = "https://api.entur.io/journey-planner/v3/graphql";
const ENTUR_CLIENT_NAME = "sceneblikk-app";

// Rate limit: Adjustable - default 30 seconds (30000 ms)
// Set to 0 to disable rate limiting
const DEPARTURES_RATE_LIMIT_MS = 0;

/**
 * Normalize stop place ID to EnTur format
 * Handles numeric IDs (e.g., "32214") by converting to "NSR:StopPlace:32214"
 */
function normalizeStopPlaceId(query: string): string {
  // If it's already in NSR format, return as-is
  if (query.startsWith("NSR:")) {
    return query;
  }
  
  // If it's a numeric ID, assume it's a stop place ID
  if (/^\d+$/.test(query.trim())) {
    return `NSR:StopPlace:${query.trim()}`;
  }
  
  // Otherwise return as-is (for name searches)
  return query;
}

/**
 * Search for stop places by name (for autocomplete/search) using Entur's geocoder API
 */
export async function searchStopPlaces(
  query: string,
  maxResults: number = 10
): Promise<StopPlace[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const url = new URL("https://api.entur.io/geocoder/v1/autocomplete");
  url.searchParams.set("text", query.trim());
  url.searchParams.set("lang", "no");
  url.searchParams.set("size", String(Math.min(maxResults * 2, 40))); // Request more to filter for stops

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "ET-Client-Name": ENTUR_CLIENT_NAME,
      },
    });

    if (!response.ok) {
      // Try to get error details from response body
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData?.message) {
          errorMessage += ` - ${errorData.message}`;
        } else if (errorData?.error) {
          errorMessage += ` - ${errorData.error}`;
        }
      } catch {
        // If we can't parse the error response, use the status text
      }
      console.error("Geocoder API error:", errorMessage, "URL:", url.toString());
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const features = Array.isArray(data?.features) ? data.features : [];

    return features
      .map((feature: any) => {
        const props = feature?.properties || {};
        const geometry = feature?.geometry || {};
        const coordinates = Array.isArray(geometry?.coordinates)
          ? geometry.coordinates
          : [];

        // Check if this is a stop place (has NSR:StopPlace ID or is in stop layer)
        const id = props.id || feature?.id || "";
        const category = props.category || "";
        const layer = props.layer || "";
        
        // Exclude street addresses and other non-stop categories
        const isStreetCategory = category === "street" || 
                                 category === "address" ||
                                 category === "locality" ||
                                 layer === "street" ||
                                 layer === "address";
        
        // Check if this is a stop place
        const isStopPlace = !isStreetCategory && (
          id.startsWith("NSR:StopPlace:") || 
          category === "onstreetBus" ||
          category === "onstreetTram" ||
          category === "railStation" ||
          category === "metroStation" ||
          category === "busStation" ||
          category === "ferryStop" ||
          category === "tramStation" ||
          layer === "venue" ||
          layer === "stop"
        );

        return {
          id,
          name: props.name || props.label || "Ukjent stopp",
          label: props.label || props.name || "Ukjent stopp", // Full label for display
          latitude: typeof coordinates[1] === "number" ? coordinates[1] : undefined,
          longitude: typeof coordinates[0] === "number" ? coordinates[0] : undefined,
          isStopPlace,
        };
      })
      .filter((feature: StopPlace & { isStopPlace?: boolean; label?: string }) => {
        // Filter to only stop places, exclude streets
        return Boolean(feature.id && feature.name && feature.isStopPlace === true);
      })
      .slice(0, maxResults) // Limit to requested number
      .map((feature: StopPlace & { isStopPlace?: boolean; label?: string }) => {
        const { isStopPlace: _, label: fullLabel, ...rest } = feature;
        // Use the full label as the name for display
        return {
          ...rest,
          name: fullLabel || rest.name,
        } as StopPlace;
      }); // Remove temporary properties and use full label
  } catch (error) {
    console.error("Error searching stop places:", error);
    return [];
  }
}

/**
 * Fetch stop place information by name or ID
 */
export async function findStopPlace(query: string): Promise<StopPlace | null> {
  // Normalize the query (handle numeric IDs)
  const normalizedQuery = normalizeStopPlaceId(query);
  
  // Check if query looks like an ID (NSR: format or numeric)
  if (normalizedQuery.startsWith("NSR:") || /^NSR:StopPlace:\d+$/.test(normalizedQuery)) {
    // Query by ID
    const queryText = `
      query($id: String!) {
        stopPlace(id: $id) {
          id
          name
          latitude
          longitude
        }
      }
    `;

    try {
      const response = await fetch(ENTUR_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ET-Client-Name": ENTUR_CLIENT_NAME,
        },
        body: JSON.stringify({
          query: queryText,
          variables: { id: normalizedQuery },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0]?.message || "GraphQL error");
      }

      const stopPlace = data.data?.stopPlace;
      if (stopPlace) {
        return {
          id: stopPlace.id,
          name: stopPlace.name,
          latitude: stopPlace.latitude,
          longitude: stopPlace.longitude,
        };
      }
    } catch (error) {
      console.error("Error finding stop place by ID:", error);
    }
  }

  // Search by name
  const queryText = `
    query($query: String!) {
      stopPlaces(query: $query, multiModal: child, maxResults: 5) {
        id
        name
        latitude
        longitude
      }
    }
  `;

  try {
    const response = await fetch(ENTUR_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ET-Client-Name": ENTUR_CLIENT_NAME,
      },
      body: JSON.stringify({
        query: queryText,
        variables: { query },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0]?.message || "GraphQL error");
    }

    const stopPlaces = data.data?.stopPlaces || [];
    const stopPlace = stopPlaces[0];
    
    if (!stopPlace) {
      return null;
    }

    return {
      id: stopPlace.id,
      name: stopPlace.name,
      latitude: stopPlace.latitude,
      longitude: stopPlace.longitude,
    };
  } catch (error) {
    console.error("Error finding stop place:", error);
    return null;
  }
}

/**
 * Fetch departures for a stop place
 */
export async function fetchDepartures(
  stopPlaceId: string,
  limit: number = 10
): Promise<Departure[]> {
  // Check rate limit if enabled (DEPARTURES_RATE_LIMIT_MS > 0)
  if (DEPARTURES_RATE_LIMIT_MS > 0) {
    const rateLimitKey = `departures_${stopPlaceId}`;
    if (!checkRateLimit(rateLimitKey, DEPARTURES_RATE_LIMIT_MS)) {
      const timeRemaining = getTimeUntilNextCall(rateLimitKey, DEPARTURES_RATE_LIMIT_MS);
      const secondsRemaining = Math.ceil(timeRemaining / 1000);
      throw new Error(`Rate limit exceeded. Please wait ${secondsRemaining} second(s) before refreshing departures.`);
    }
  }

  // Normalize the stop place ID
  const normalizedId = normalizeStopPlaceId(stopPlaceId);
  
  // Calculate timeRange based on the number of departures requested
  // Use a conservative estimate: 12 minutes per departure (720 seconds)
  // Minimum 1 hour (3600 seconds) to ensure we get at least some results
  const timeRange = Math.max(3600, limit * 720);
  
  const queryText = `
    query($id: String!, $numberOfDepartures: Int!, $timeRange: Int!) {
      stopPlace(id: $id) {
        id
        name
        estimatedCalls(numberOfDepartures: $numberOfDepartures, timeRange: $timeRange) {
          realtime
          aimedArrivalTime
          expectedArrivalTime
          actualArrivalTime
          aimedDepartureTime
          expectedDepartureTime
          actualDepartureTime
          date
          destinationDisplay {
            frontText
          }
          serviceJourney {
            journeyPattern {
              line {
                id
                publicCode
                transportMode
              }
            }
          }
          quay {
            id
            publicCode
            name
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(ENTUR_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ET-Client-Name": ENTUR_CLIENT_NAME,
      },
      body: JSON.stringify({
        query: queryText,
        variables: { id: normalizedId, numberOfDepartures: limit, timeRange },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0]?.message || "GraphQL error");
    }

    const stopPlace = data.data?.stopPlace;
    if (!stopPlace) {
      return [];
    }

    const estimatedCalls = stopPlace.estimatedCalls || [];
    
    return estimatedCalls.map((call: any, idx: number) => {
      const departureTime = call.expectedDepartureTime || call.aimedDepartureTime;
      const scheduledTime = call.aimedDepartureTime;
      
      // Calculate delay in seconds
      let delay: number | undefined;
      if (call.expectedDepartureTime && call.aimedDepartureTime) {
        const expected = new Date(call.expectedDepartureTime).getTime();
        const scheduled = new Date(call.aimedDepartureTime).getTime();
        delay = Math.round((expected - scheduled) / 1000 / 60); // Convert to minutes
      }

      // Create a stable ID for each departure so React list keys remain consistent
      // even when the array is refreshed or items move position.
      const lineId =
        call.serviceJourney?.journeyPattern?.line?.publicCode ||
        call.serviceJourney?.journeyPattern?.line?.id ||
        "line";
      const quayId = call.quay?.id || call.quay?.publicCode || "quay";
      const departureIdentifier =
        call.aimedDepartureTime ||
        call.expectedDepartureTime ||
        call.actualDepartureTime ||
        call.date ||
        idx;
      const stableId = `${normalizedId}-${lineId}-${quayId}-${departureIdentifier}`;

      return {
        id: stableId,
        line: call.serviceJourney?.journeyPattern?.line?.publicCode || "N/A",
        destination: call.destinationDisplay?.frontText || "Ukjent destinasjon",
        scheduledDeparture: scheduledTime,
        expectedDeparture: departureTime,
        delay: delay !== undefined && delay !== 0 ? delay : undefined,
        platform: call.quay?.publicCode || call.quay?.name,
        serviceType: call.serviceJourney?.journeyPattern?.line?.transportMode,
      } as Departure;
    });
  } catch (error) {
    console.error("Error fetching departures:", error);
    throw error;
  }
}

/**
 * Fetch transport data for a stop place
 */
export async function fetchTransportData(
  stopPlaceQuery: string,
  limit: number = 10
): Promise<TransportData> {
  // First, find the stop place
  const stopPlace = await findStopPlace(stopPlaceQuery);
  
  if (!stopPlace) {
    throw new Error(`Stop place not found: ${stopPlaceQuery}`);
  }

  // Then fetch departures
  const departures = await fetchDepartures(stopPlace.id, limit);

  return {
    stopPlace,
    departures,
    lastUpdated: new Date(),
  };
}

/**
 * Format time for display
 */
export function formatDepartureTime(
  timeString: string | undefined,
  format: "12h" | "24h" = "24h"
): string {
  if (!timeString) return "--:--";
  
  const date = new Date(timeString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  if (format === "12h") {
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  }
  
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Calculate minutes until departure
 */
export function minutesUntilDeparture(departureTime: string | undefined): number | null {
  if (!departureTime) return null;
  
  const departure = new Date(departureTime).getTime();
  const now = Date.now();
  const diffMinutes = Math.round((departure - now) / 1000 / 60);
  
  return diffMinutes >= 0 ? diffMinutes : null;
}

/** Minutes until departure for “X min” display; null when >30 min so UI shows clock time instead. */
export function minutesUntilDepartureForDisplay(departureTime: string | undefined): number | null {
  const m = minutesUntilDeparture(departureTime);
  if (m === null) return null;
  return m > 30 ? null : m;
}

