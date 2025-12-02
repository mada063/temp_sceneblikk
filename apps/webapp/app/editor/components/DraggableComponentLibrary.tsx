"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type PointerEvent as ReactPointerEvent } from "react";
import { FiMoreHorizontal, FiSearch, FiX } from "react-icons/fi";
import { PLACEHOLDER_LIBRARY } from "../../lib/placeholders";

const STORAGE_KEY = "component-library-position";

type Position = {
  x: number;
  y: number;
};

// Utility function to get saved position from localStorage
export function getSavedComponentLibraryPosition(): Position {
  if (typeof window === "undefined") {
    return { x: 100, y: 100 };
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { x: parsed.x ?? 100, y: parsed.y ?? 100 };
    }
  } catch {
    // Invalid JSON, use defaults
  }
  return { x: 100, y: 100 };
}

type DraggableComponentLibraryProps = {
  onDragStartPalette: (componentId: string) => (event: DragEvent<HTMLDivElement>) => void;
  onClose?: () => void;
  initialPosition?: Position;
};

export function DraggableComponentLibrary({
  onDragStartPalette,
  onClose,
  initialPosition,
}: DraggableComponentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [position, setPosition] = useState<Position>(() => {
    // Always read from localStorage on mount to ensure we get the latest saved position
    // This ensures position persists when detaching/reattaching
    // Use initialPosition only if explicitly provided (for special cases)
    return initialPosition ?? getSavedComponentLibraryPosition();
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Save position to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    }
  }, [position]);

  // Also save position when component unmounts to ensure it's persisted
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && position) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
      }
    };
  }, [position]);

  const filteredComponents = useMemo(() => {
    if (!searchQuery.trim()) {
      return PLACEHOLDER_LIBRARY;
    }
    const query = searchQuery.toLowerCase().trim();
    return PLACEHOLDER_LIBRARY.filter(
      (component) =>
        component.label.toLowerCase().includes(query) ||
        component.description.toLowerCase().includes(query) ||
        component.id.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return; // Only handle left mouse button
    const target = event.target as HTMLElement;
    // Don't start dragging if clicking on interactive elements or their children
    if (target.closest("input, button, [draggable], a") || target.matches("input, button, [draggable], a")) {
      return;
    }

    event.preventDefault();
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!isDragging) return;

      const newX = event.clientX - dragOffset.x;
      const newY = event.clientY - dragOffset.y;

      // Constrain to viewport
      const maxX = window.innerWidth - (containerRef.current?.offsetWidth ?? 400);
      const maxY = window.innerHeight - (containerRef.current?.offsetHeight ?? 200);
      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));

      setPosition({ x: constrainedX, y: constrainedY });
    },
    [isDragging, dragOffset],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
      return () => {
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  return (
    <div
      ref={containerRef}
      className="glass-surface fixed z-50 flex h-[50vh] w-[38vh] flex-col overflow-hidden rounded-3xl border border-custom-color-200/70 bg-white/95 shadow-2xl transition-colors dark:border-white/10 dark:bg-custom-color-900/80"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "default",
      }}
      onPointerDown={handlePointerDown}
    >
      {/* Header with drag handle */}
      <div className="flex items-center justify-between border-b border-custom-color-100/70 px-6 py-4 dark:border-white/10">
        <div className="flex items-center gap-2 mr-2">
            <FiMoreHorizontal className="h-4 w-4" />
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-custom-color-600 dark:text-custom-color-200">
          Component library
        </h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-lg p-1.5 text-custom-color-600 transition hover:bg-custom-color-200/50 hover:text-custom-color-800 dark:text-custom-color-200 dark:hover:bg-custom-color-700/50 dark:hover:text-custom-color-100"
            aria-label="Close component library"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="border-b border-custom-color-100/70 px-6 py-3 dark:border-white/10">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-custom-color-800 dark:text-custom-color-50" />
          <input
            type="search"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-custom-color-50 bg-white/95 pl-10 pr-3 py-2 text-sm font-medium text-custom-color-800 dark:text-custom-color-50 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50 dark:placeholder:text-custom-color-300/50"
          />
        </div>
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 custom-scrollbar">
        {filteredComponents.length > 0 ? (
          <div className="grid gap-3">
            {filteredComponents.map((component) => (
              <div
                key={component.id}
                draggable
                onDragStart={onDragStartPalette(component.id)}
                className="group flex cursor-grab items-start gap-3 rounded-xl border border-custom-color-300/60 bg-white/85 p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-custom-color-400/70 hover:shadow-lg active:cursor-grabbing dark:border-white/10 dark:bg-custom-color-800/70"
              >
                <component.icon className="mt-1 h-5 w-5 text-custom-color-600 dark:text-custom-color-200" />
                <div>
                  <p className="text-sm font-semibold text-custom-color-900 dark:text-custom-color-100">
                    {component.label}
                  </p>
                  <p className="text-xs text-custom-color-700/80 dark:text-custom-color-100/60">
                    {component.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FiSearch className="mb-3 h-8 w-8 text-custom-color-800 dark:text-custom-color-50" />
            <p className="text-sm font-semibold text-custom-color-800 dark:text-custom-color-50">
              No components found
            </p>
            <p className="mt-1 text-xs text-custom-color-500 dark:text-custom-color-300">
              Try a different search term
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

