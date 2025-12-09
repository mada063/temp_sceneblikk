"use client";

import { useEffect, useRef, useState } from "react";

type MinuteRow = {
  id: string;
  minutes: number | null;
};

const DIGIT_ANIMATION_DURATION = 300; // ms, slightly longer than clock for clarity

export function useMinuteFlipAnimation(
  rows: MinuteRow[],
  duration: number = DIGIT_ANIMATION_DURATION
) {
  const prevMinutesRef = useRef<Map<string, number | null>>(new Map());
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const prevMinutes = prevMinutesRef.current;
    const nextMinutes = new Map<string, number | null>();
    const changedIds: string[] = [];

    rows.forEach((row) => {
      nextMinutes.set(row.id, row.minutes);
      if (prevMinutes.has(row.id)) {
        const prevValue = prevMinutes.get(row.id);
        if (prevValue !== row.minutes && row.minutes !== null) {
          changedIds.push(row.id);
        }
      }
    });

    prevMinutesRef.current = nextMinutes;

    if (!changedIds.length) {
      return;
    }

    setAnimatingIds((prev) => {
      const next = new Set(prev);
      changedIds.forEach((id) => next.add(id));
      return next;
    });

    const timeout = setTimeout(() => {
      setAnimatingIds((prev) => {
        const next = new Set(prev);
        changedIds.forEach((id) => next.delete(id));
        return next;
      });
    }, duration);

    return () => clearTimeout(timeout);
  }, [rows, duration]);

  return animatingIds;
}



