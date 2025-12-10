"use client";

import { useEffect, useState, useRef } from "react";

const INITIAL_FADE_DURATION = 800;
const CELL_STAGGER_DELAY = 30; // ms between cells

export function useCalendarAnimations(
  totalCells: number,
  weekKey?: string | number,
  disableAnimations?: boolean,
) {
  const [isAnimating, setIsAnimating] = useState(!disableAnimations);
  const prevWeekKeyRef = useRef<string | number | undefined>(weekKey);
  const isFirstMountRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If animations are disabled, skip all animation logic
    if (disableAnimations) {
      setIsAnimating(false);
      isFirstMountRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    const isWeekChange = weekKey !== undefined && weekKey !== prevWeekKeyRef.current;
    const isFirstMount = isFirstMountRef.current;
    
    // On first mount, we want to animate
    // On week changes (after first mount), we also want to animate
    if (isWeekChange && !isFirstMount) {
      prevWeekKeyRef.current = weekKey;
      setIsAnimating(true);
    } else if (isFirstMount) {
      // First mount - initialize and keep animating
      prevWeekKeyRef.current = weekKey;
      setIsAnimating(true);
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const totalStagger = totalCells * CELL_STAGGER_DELAY;
    const animationDuration = INITIAL_FADE_DURATION + totalStagger;

    timeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      // Mark that we've completed the initial animation
      if (isFirstMountRef.current) {
        isFirstMountRef.current = false;
      }
    }, animationDuration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [totalCells, weekKey, disableAnimations]);

  return {
    isAnimating: disableAnimations ? false : isAnimating,
    // isInitialLoad is true only on the very first mount before animation completes (and animations enabled)
    isInitialLoad: !disableAnimations && isAnimating && isFirstMountRef.current,
  };
}

export const CALENDAR_ANIMATION = {
  duration: INITIAL_FADE_DURATION,
  stagger: CELL_STAGGER_DELAY,
};





