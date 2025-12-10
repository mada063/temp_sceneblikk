"use client";

import { useEffect, useState, useRef } from "react";

const INITIAL_FADE_DURATION = 800;
const CELL_STAGGER_DELAY = 30; // ms between cells

export function useCalendarAnimations(
  totalCells: number,
  weekKey?: string | number,
) {
  const [isAnimating, setIsAnimating] = useState(true);
  const prevWeekKeyRef = useRef<string | number | undefined>(weekKey);
  const isFirstRenderRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset animation state when week changes
    if (weekKey !== undefined && weekKey !== prevWeekKeyRef.current) {
      prevWeekKeyRef.current = weekKey;
      setIsAnimating(true);
      isFirstRenderRef.current = false;
    } else if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const totalStagger = totalCells * CELL_STAGGER_DELAY;
    const animationDuration = INITIAL_FADE_DURATION + totalStagger;

    timeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, animationDuration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [totalCells, weekKey]);

  return {
    isAnimating,
    // Keep isInitialLoad for backward compatibility
    isInitialLoad: isAnimating && isFirstRenderRef.current,
  };
}

export const CALENDAR_ANIMATION = {
  duration: INITIAL_FADE_DURATION,
  stagger: CELL_STAGGER_DELAY,
};





