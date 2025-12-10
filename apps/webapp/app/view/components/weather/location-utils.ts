import type { WeatherLocation } from "./types";
// @ts-ignore - JSON import
import weatherLocationsData from "../../../lib/weather-locations.json";

// Type assertion for the imported JSON data
const allLocations = weatherLocationsData as WeatherLocation[];

/**
 * Search for weather locations by query string
 * Searches in name, label, municipality, county, and searchTerms
 */
export function searchWeatherLocations(
  query: string,
  maxResults: number = 10
): WeatherLocation[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const normalizedQuery = query.trim().toLowerCase();

  // Score locations based on match quality
  const scoredLocations = allLocations
    .map((location) => {
      let score = 0;
      const nameLower = location.name.toLowerCase();
      const labelLower = location.label.toLowerCase();
      const municipalityLower = (location.municipality || "").toLowerCase();
      const countyLower = (location.county || "").toLowerCase();
      const searchTermsLower = (location.searchTerms || []).join(" ").toLowerCase();

      // Exact name match gets highest score
      if (nameLower === normalizedQuery) {
        score += 100;
      } else if (nameLower.startsWith(normalizedQuery)) {
        score += 50;
      } else if (nameLower.includes(normalizedQuery)) {
        score += 25;
      }

      // Label match
      if (labelLower.includes(normalizedQuery)) {
        score += 20;
      }

      // Municipality match
      if (municipalityLower.includes(normalizedQuery)) {
        score += 15;
      }

      // County match
      if (countyLower.includes(normalizedQuery)) {
        score += 10;
      }

      // Search terms match
      if (searchTermsLower.includes(normalizedQuery)) {
        score += 5;
      }

      return { location, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((item) => item.location);

  return scoredLocations;
}

/**
 * Find a weather location by ID or coordinates (value)
 */
export function findWeatherLocation(
  query: string
): WeatherLocation | null {
  if (!query) {
    return null;
  }

  // Try to find by ID first
  const byId = allLocations.find((loc) => loc.id === query);
  if (byId) {
    return byId;
  }

  // Try to find by value (coordinates)
  const byValue = allLocations.find((loc) => loc.value === query);
  if (byValue) {
    return byValue;
  }

  // Try to find by name (case-insensitive)
  const normalizedQuery = query.trim().toLowerCase();
  const byName = allLocations.find(
    (loc) => loc.name.toLowerCase() === normalizedQuery
  );
  if (byName) {
    return byName;
  }

  // Try search as fallback
  const searchResults = searchWeatherLocations(query, 1);
  return searchResults.length > 0 ? searchResults[0] : null;
}

/**
 * Get all locations for a specific county
 */
export function getLocationsByCounty(county: string): WeatherLocation[] {
  return allLocations.filter(
    (loc) => loc.county?.toLowerCase() === county.toLowerCase()
  );
}

/**
 * Get all locations for a specific country
 */
export function getLocationsByCountry(country: string): WeatherLocation[] {
  return allLocations.filter(
    (loc) => loc.country.toLowerCase() === country.toLowerCase()
  );
}

/**
 * Get all available locations
 */
export function getAllWeatherLocations(): WeatherLocation[] {
  return allLocations;
}





