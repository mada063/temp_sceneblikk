"use client";

import { useState, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { searchWeatherLocations, findWeatherLocation } from "../../../view/components/weather/location-utils";
import type { WeatherLocation } from "../../../view/components/weather/types";

const SearchIcon = FiSearch as React.ComponentType<{ className?: string }>;

export function WeatherLocationSelector({
  value,
  onChange,
  locationName,
}: {
  value: string;
  onChange: (locationValue: string) => void;
  locationName?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<WeatherLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentName, setCurrentName] = useState<string | null>(locationName || null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(() => {
      try {
        const results = searchWeatherLocations(searchQuery.trim(), 8);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching weather locations:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLocation = (location: WeatherLocation) => {
    setCurrentName(location.label);
    onChange(location.value);
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    setIsFocused(false);
  };

  // Update current name when locationName prop changes
  useEffect(() => {
    if (locationName) {
      setCurrentName(locationName);
    }
  }, [locationName]);

  // Fetch location name when value changes (if we don't have a name)
  useEffect(() => {
    if (value && !currentName && !searchQuery) {
      const location = findWeatherLocation(value);
      if (location?.label) {
        setCurrentName(location.label);
      }
    }
  }, [value, currentName, searchQuery]);

  // Track if input is focused to control display behavior
  const [isFocused, setIsFocused] = useState(false);

  // Display value: show search query when typing, otherwise show name/coordinates
  const displayValue = searchQuery !== "" 
    ? searchQuery 
    : (currentName || value || "");

  // Placeholder: show default placeholder when not focused, or when focused and no current value
  const placeholder = "Search location (e.g., Bergen, Stavanger, Vestland)";

  // Check if we should show the value with placeholder opacity (focused but not typing)
  const showPlaceholderStyle = isFocused && !searchQuery && (currentName || value);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={(event) => {
            const newValue = event.target.value;
            setSearchQuery(newValue);
            setShowDropdown(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            // Clear search query on focus to allow fresh typing
            setSearchQuery("");
            setShowDropdown(false);
          }}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => {
              setShowDropdown(false);
              // Reset search query when blurring if no selection was made
              if (searchQuery && searchQuery !== currentName) {
                setSearchQuery("");
              }
            }, 200);
          }}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 pr-10 text-sm font-medium shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 ${
            showPlaceholderStyle 
              ? "text-custom-color-400 dark:text-custom-color-500" 
              : "text-custom-color-800 dark:text-custom-color-50"
          }`}
        />
        <SearchIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-custom-color-400 dark:text-custom-color-500" />
      </div>
      
      {showDropdown && (searchResults.length > 0 || isSearching) && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-custom-color-300/50 bg-white shadow-lg dark:border-white/10 dark:bg-custom-color-800">
          {isSearching ? (
            <div className="px-4 py-3 text-sm text-custom-color-600 dark:text-custom-color-400">
              Searching...
            </div>
          ) : searchResults.length === 0 ? (
            <div className="px-4 py-3 text-sm text-custom-color-600 dark:text-custom-color-400">
              No results found. Try searching by city, municipality, or county name.
            </div>
          ) : (
            searchResults.map((location) => (
              <button
                key={location.id}
                type="button"
                onClick={() => handleSelectLocation(location)}
                className="w-full px-4 py-2 text-left text-sm text-custom-color-800 hover:bg-custom-color-100 dark:text-custom-color-50 dark:hover:bg-custom-color-700"
              >
                <div className="font-medium">{location.label}</div>
                {location.county && (
                  <div className="text-xs text-custom-color-500 dark:text-custom-color-400">
                    {location.county}{location.municipality && location.municipality !== location.name ? `, ${location.municipality}` : ""}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      )}
      
    </div>
  );
}
