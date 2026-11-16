"use client";

import { useState, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { searchStopPlaces, findStopPlace } from "../../../view/components/transport/utils";
import type { StopPlace } from "../../../view/components/transport/types";
import { useI18n } from "../../../lib/i18n";

const SearchIcon = FiSearch as React.ComponentType<{ className?: string }>;

export function StopPlaceSelector({
  value,
  onChange,
  stopPlaceName,
}: {
  value: string;
  onChange: (stopPlaceId: string) => void;
  stopPlaceName?: string;
}) {
  const { locale } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StopPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentName, setCurrentName] = useState<string | null>(stopPlaceName || null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract numeric ID from NSR:StopPlace:XXX format for display
  const extractNumericId = (id: string): string => {
    const match = id.match(/NSR:StopPlace:(\d+)/);
    return match ? match[1] : id;
  };

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
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchStopPlaces(searchQuery.trim(), 8);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching stop places:", error);
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

  const handleSelectStopPlace = (stopPlace: StopPlace) => {
    // Store just the numeric ID (e.g., "32214") for simplicity
    // The utils will convert it to NSR:StopPlace:32214 format when needed
    const idToStore = extractNumericId(stopPlace.id);
    
    setCurrentName(stopPlace.name);
    onChange(idToStore);
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    setIsFocused(false);
  };

  // Update current name when stopPlaceName prop changes
  useEffect(() => {
    if (stopPlaceName) {
      setCurrentName(stopPlaceName);
    }
  }, [stopPlaceName]);

  // Fetch stop place name when value changes (if we don't have a name)
  useEffect(() => {
    if (value && !currentName && !searchQuery) {
      // Try to fetch the name from the ID
      findStopPlace(value)
        .then((stopPlace) => {
          if (stopPlace?.name) {
            setCurrentName(stopPlace.name);
          }
        })
        .catch(() => {
          // Silently fail - we'll just show the ID
        });
    }
  }, [value, currentName, searchQuery]);

  // Track if input is focused to control display behavior
  const [isFocused, setIsFocused] = useState(false);

  // Display value: show search query when typing, otherwise show name/ID
  const displayValue = searchQuery !== "" 
    ? searchQuery 
    : (currentName || value || "");

  // Placeholder: show default placeholder
  const placeholder =
    locale === "nb"
      ? "Søk etter holdeplass eller skriv inn ID (f.eks. 32214)"
      : "Search stop place or enter ID (e.g., 32214)";

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
            // Also update the value directly if user is typing
            onChange(newValue.trim());
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
              if (searchQuery && searchQuery !== currentName && searchQuery !== value) {
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
              {locale === "nb" ? "Søker …" : "Searching..."}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="px-4 py-3 text-sm text-custom-color-600 dark:text-custom-color-400">
              {locale === "nb"
                ? "Ingen treff. Du kan også skrive inn en holdeplass-ID direkte (f.eks. 32214)."
                : "No results found. You can enter a stop place ID directly (e.g., 32214)."}
            </div>
          ) : (
            searchResults.map((stopPlace) => (
              <button
                key={stopPlace.id}
                type="button"
                onClick={() => handleSelectStopPlace(stopPlace)}
                className="w-full px-4 py-2 text-left text-sm text-custom-color-800 hover:bg-custom-color-100 dark:text-custom-color-50 dark:hover:bg-custom-color-700"
              >
                <div className="font-medium">{stopPlace.name}</div>
                {stopPlace.id && (
                  <div className="text-xs text-custom-color-500 dark:text-custom-color-400">
                    ID: {extractNumericId(stopPlace.id)}
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
