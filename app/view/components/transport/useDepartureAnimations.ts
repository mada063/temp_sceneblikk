"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Departure } from "./types";

/** Sync with globals `.animate-slide-up-bounce` duration. */
const DEFAULT_ANIMATION_DURATION = 420;
/** Stagger for initial row sequence + new-row fade-ins (~100ms between steps). */
const INITIAL_STAGGER_DELAY = 100;
/** Stagger between departure rows when bouncing (matches user preference ~100ms). */
const BOUNCE_STAGGER_DELAY = 100;
const NEW_FADE_EXTRA_DELAY = 120; // wait after bounce before fading new rows

export function useDepartureAnimations(
  departures: Departure[],
  duration: number = DEFAULT_ANIMATION_DURATION
) {
  const prevIdsRef = useRef<string[] | null>(null);
  const [initialFade, setInitialFade] = useState(true);
  const [shouldBounce, setShouldBounce] = useState(false);
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());
  const idSignature = useMemo(
    () => departures.map((d) => d.id).join("|"),
    [departures]
  );
  const stableDepartures = useMemo(() => departures, [idSignature]);

  useLayoutEffect(() => {
    if (!stableDepartures || stableDepartures.length === 0) {
      prevIdsRef.current = null;
      setInitialFade(true);
      setShouldBounce(false);
      setNewItemIds(new Set());
      return;
    }

    const ids = stableDepartures.map((d) => d.id);
    const previous = prevIdsRef.current;

    if (!previous) {
      prevIdsRef.current = ids;
      setInitialFade(true);
      setNewItemIds(new Set(ids));
      return;
    }

    const added = ids.filter((id) => !previous.includes(id));
    const removed = previous.filter((id) => !ids.includes(id));
    const compareLength = Math.min(previous.length, ids.length);
    let reordered = false;
    for (let index = 0; index < compareLength; index += 1) {
      if (previous[index] !== ids[index]) {
        reordered = true;
        break;
      }
    }

    if (added.length > 0) {
      setNewItemIds((prev) => {
        const sameSize = prev.size === added.length;
        if (sameSize) {
          let identical = true;
          for (const id of added) {
            if (!prev.has(id)) {
              identical = false;
              break;
            }
          }
          if (identical) {
            return prev;
          }
        }
        return new Set(added);
      });
    } else {
      setNewItemIds((prev) => {
        if (prev.size === 0) {
          return prev;
        }
        return new Set();
      });
    }

    if (removed.length > 0 || reordered) {
      setShouldBounce(false);
      if (typeof window !== "undefined") {
        window.requestAnimationFrame(() => setShouldBounce(true));
      } else {
        setTimeout(() => setShouldBounce(true), 0);
      }
    }

    prevIdsRef.current = ids;
  }, [idSignature, stableDepartures]);

  useEffect(() => {
    if (initialFade) {
      const extra =
        Math.max(0, stableDepartures.length - 1) * INITIAL_STAGGER_DELAY;
      const timeout = setTimeout(
        () => setInitialFade(false),
        duration + extra
      );
      return () => clearTimeout(timeout);
    }
  }, [initialFade, duration, stableDepartures.length]);

  useEffect(() => {
    if (shouldBounce) {
      const extra =
        Math.max(0, stableDepartures.length - 1) * BOUNCE_STAGGER_DELAY;
      const timeout = setTimeout(
        () => setShouldBounce(false),
        duration + extra
      );
      return () => clearTimeout(timeout);
    }
  }, [shouldBounce, duration, stableDepartures.length]);

  useEffect(() => {
    if (newItemIds.size > 0) {
      const timeout = setTimeout(() => setNewItemIds(new Set()), duration);
      return () => clearTimeout(timeout);
    }
  }, [newItemIds, duration]);

  return {
    playInitialFade: initialFade,
    shouldBounce,
    newItemIds,
  };
}

export const TRANSPORT_ANIMATION = {
  duration: DEFAULT_ANIMATION_DURATION,
  initialStagger: INITIAL_STAGGER_DELAY,
  bounceStagger: BOUNCE_STAGGER_DELAY,
  newFadeExtraDelay: NEW_FADE_EXTRA_DELAY,
};

