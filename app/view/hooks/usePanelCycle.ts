"use client";

import { useEffect, useState } from "react";
import type { PanelEntry } from "../../lib/layout-types";

/**
 * Hook to cycle through panel entries based on their durations.
 * Returns the current active entry index and entry.
 */
export function usePanelCycle(
  entries: PanelEntry[] | undefined,
): { activeIndex: number; activeEntry: PanelEntry | null } {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!entries || entries.length === 0) {
      setActiveIndex(0);
      return;
    }

    // Single entry - no cycling needed
    if (entries.length === 1) {
      setActiveIndex(0);
      return;
    }

    // Reset to first entry when entries change
    setActiveIndex(0);

    // Cycle through entries
    let currentIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      const currentEntry = entries[currentIndex];
      if (!currentEntry) {
        return;
      }

      timeoutId = setTimeout(() => {
        currentIndex = (currentIndex + 1) % entries.length;
        setActiveIndex(currentIndex);
        scheduleNext();
      }, currentEntry.duration * 1000);
    };

    scheduleNext();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [entries]);

  const activeEntry =
    entries && entries.length > 0 ? entries[activeIndex] ?? null : null;

  return { activeIndex, activeEntry };
}



