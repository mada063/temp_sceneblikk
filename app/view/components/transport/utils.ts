import type { TransportData, Departure, StopPlace } from "./types";

const ENTUR_API_URL = "https://api.entur.io/journey-planner/v3/graphql";
const ENTUR_CLIENT_NAME = "sceneblikk-app";

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
 * Search for stop places by name (for autocomplete/search)
 */
export async function searchStopPlaces(query: string, maxResults: number = 10): Promise<StopPlace[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const queryText = `
    query($query: String!, $maxResults: Int!) {
      stopPlaces(query: $query, multiModal: parent, maxResults: $maxResults) {
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
        variables: { query: query.trim(), maxResults },
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
    
    return stopPlaces.map((sp: any) => ({
      id: sp.id,
      name: sp.name,
      latitude: sp.latitude,
      longitude: sp.longitude,
    }));
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
  // Normalize the stop place ID
  const normalizedId = normalizeStopPlaceId(stopPlaceId);
  const queryText = `
    query($id: String!, $numberOfDepartures: Int!) {
      stopPlace(id: $id) {
        id
        name
        estimatedCalls(numberOfDepartures: $numberOfDepartures, timeRange: 3600) {
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
        variables: { id: normalizedId, numberOfDepartures: limit },
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

      return {
        id: `${normalizedId}-${idx}`,
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

