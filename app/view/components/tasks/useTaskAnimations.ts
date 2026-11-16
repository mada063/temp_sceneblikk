"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Task } from "./types";

const DEFAULT_ANIMATION_DURATION = 650;
const INITIAL_STAGGER_DELAY = 90; // ms between tasks on first load
const SLIDE_UP_DURATION = 300; // ms for smooth slide-up transition
const NEW_FADE_EXTRA_DELAY = 200; // wait after slide-up before fading new tasks

export function useTaskAnimations(
  tasks: Task[],
  duration: number = DEFAULT_ANIMATION_DURATION
) {
  const prevIdsRef = useRef<string[] | null>(null);
  const [initialFade, setInitialFade] = useState(true);
  const [shouldSlideUp, setShouldSlideUp] = useState(false);
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());
  const idSignature = useMemo(
    () => tasks.map((t) => t.id).join("|"),
    [tasks]
  );
  const stableTasks = useMemo(() => tasks, [idSignature]);

  useLayoutEffect(() => {
    if (!stableTasks || stableTasks.length === 0) {
      prevIdsRef.current = null;
      setInitialFade(true);
      setShouldSlideUp(false);
      setNewItemIds(new Set());
      return;
    }

    const ids = stableTasks.map((t) => t.id);
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
      setShouldSlideUp(false);
      if (typeof window !== "undefined") {
        window.requestAnimationFrame(() => setShouldSlideUp(true));
      } else {
        setTimeout(() => setShouldSlideUp(true), 0);
      }
    }

    prevIdsRef.current = ids;
  }, [idSignature, stableTasks]);

  useEffect(() => {
    if (initialFade) {
      const extra =
        Math.max(0, stableTasks.length - 1) * INITIAL_STAGGER_DELAY;
      const timeout = setTimeout(
        () => setInitialFade(false),
        duration + extra
      );
      return () => clearTimeout(timeout);
    }
  }, [initialFade, duration, stableTasks.length]);

  useEffect(() => {
    if (shouldSlideUp) {
      const timeout = setTimeout(
        () => setShouldSlideUp(false),
        SLIDE_UP_DURATION
      );
      return () => clearTimeout(timeout);
    }
  }, [shouldSlideUp]);

  useEffect(() => {
    if (newItemIds.size > 0) {
      const timeout = setTimeout(() => setNewItemIds(new Set()), duration);
      return () => clearTimeout(timeout);
    }
  }, [newItemIds, duration]);

  return {
    playInitialFade: initialFade,
    shouldSlideUp,
    newItemIds,
  };
}

export const TASKS_ANIMATION = {
  duration: DEFAULT_ANIMATION_DURATION,
  initialStagger: INITIAL_STAGGER_DELAY,
  slideUpDuration: SLIDE_UP_DURATION,
  newFadeExtraDelay: NEW_FADE_EXTRA_DELAY,
};

