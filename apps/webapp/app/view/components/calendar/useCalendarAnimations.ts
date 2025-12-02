"use client";

import { useEffect, useState, useRef } from "react";

const INITIAL_FADE_DURATION = 800;
const CELL_STAGGER_DELAY = 30; // ms between cells

export function useCalendarAnimations(totalCells: number) {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (hasAnimatedRef.current) return;

    const totalStagger = totalCells * CELL_STAGGER_DELAY;
    const timeout = setTimeout(() => {
      setIsInitialLoad(false);
      hasAnimatedRef.current = true;
    }, INITIAL_FADE_DURATION + totalStagger);

    return () => clearTimeout(timeout);
  }, [totalCells]);

  return {
    isInitialLoad,
  };
}

export const CALENDAR_ANIMATION = {
  duration: INITIAL_FADE_DURATION,
  stagger: CELL_STAGGER_DELAY,
};


