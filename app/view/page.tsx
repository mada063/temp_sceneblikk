'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiMaximize,
  FiMinimize,
  FiMonitor,
} from "react-icons/fi";
import {
  GridCell,
  GridConfig,
  LAYOUT_STORAGE_KEY,
  PersistedLayoutState,
  createEmptyGrid,
  deriveGridGeometry,
  enforceGridCapacity,
  normalizeConfig,
  type GridGeometry,
} from "../lib/layout-types";
import { PLACEHOLDER_MAP } from "../lib/placeholders";

type PlayerState = {
  config: GridConfig;
  geometry: GridGeometry;
  cells: Record<string, GridCell>;
};

const parseKey = (key: string) => {
  const [rowRaw, columnRaw] = key.split("-");
  const row = Number.parseInt(rowRaw, 10);
  const column = Number.parseInt(columnRaw, 10);
  return {
    row: Number.isFinite(row) ? row : 0,
    column: Number.isFinite(column) ? column : 0,
  };
};

export default function ViewPage() {
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [cursorHidden, setCursorHidden] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (!raw) {
        setPlayerState(null);
        return;
      }
      const parsed = JSON.parse(raw) as Partial<PersistedLayoutState>;
      if (!parsed.config) {
        setPlayerState(null);
        return;
      }
      const normalizedConfig = enforceGridCapacity(
        normalizeConfig(parsed.config),
      );
      const geometry = deriveGridGeometry({
        screenInches: normalizedConfig.screenInches,
        orientation: normalizedConfig.orientation,
      });
      const baseline = createEmptyGrid(
        normalizedConfig.rows,
        normalizedConfig.columns,
      );
      const storedCells = parsed.cells ?? {};
      for (const key of Object.keys(baseline)) {
        if (storedCells[key]) {
          baseline[key] = storedCells[key];
        }
      }
      setPlayerState({
        config: normalizedConfig,
        geometry,
        cells: baseline,
      });
    } catch (error) {
      console.warn("Unable to read layout for player view", error);
      setPlayerState(null);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    let inactivityTimer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      setCursorHidden(false);
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => setCursorHidden(true), 2500);
    };
    resetTimer();
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("touchstart", resetTimer);
    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (typeof document === "undefined") {
      return;
    }
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn("Unable to toggle fullscreen mode", error);
    }
  };

  const orderedCells = useMemo(() => {
    if (!playerState) {
      return [];
    }
    const { cells, config } = playerState;
    const baseline = createEmptyGrid(config.rows, config.columns);
    const merged = { ...baseline, ...cells };
    return Object.entries(merged)
      .filter(([, cell]) => !cell.coveredBy)
      .sort((a, b) => {
        const coordsA = parseKey(a[0]);
        const coordsB = parseKey(b[0]);
        if (coordsA.row === coordsB.row) {
          return coordsA.column - coordsB.column;
        }
        return coordsA.row - coordsB.row;
      });
  }, [playerState]);

  const containerClasses = [
    "min-h-screen",
    "transition-colors",
    "duration-300",
    "bg-black",
    "text-white",
    cursorHidden ? "cursor-none" : "cursor-auto",
  ].join(" ");

  if (!playerState) {
    return (
      <div className={`${containerClasses} flex flex-col items-center justify-center gap-6 px-6 text-center`}>
        <div className="rounded-3xl border border-white/20 bg-white/5 px-6 py-4 backdrop-blur">
          <FiAlertTriangle className="mx-auto mb-3 h-10 w-10 text-custom-color-300" />
          <h1 className="text-xl font-semibold">No layout found</h1>
          <p className="mt-2 max-w-md text-sm text-white/70">
            We could not find a saved layout. Design a screen in the editor and
            try opening the player again.
          </p>
        </div>
        <Link
          href="/editor"
          className="inline-flex items-center gap-2 rounded-full bg-custom-color-400 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-custom-color-300"
        >
          <FiArrowLeft className="h-4 w-4" />
          Return to editor
        </Link>
      </div>
    );
  }

  const { config, geometry } = playerState;

  return (
    <div className={containerClasses}>
      <div className="absolute left-1/2 top-6 z-20 flex -translate-x-1/2 flex-wrap items-center justify-center gap-4 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
          <FiMonitor className="h-4 w-4" />
          Live player
        </span>
        <span className="hidden text-xs text-white/60 sm:inline">
          {config.screenInches.toFixed(1)} in diagonal · {config.columns} × {config.rows} grid
        </span>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:border-white/40 hover:bg-white/20"
        >
          {isFullscreen ? (
            <>
              <FiMinimize className="h-3.5 w-3.5" />
              Exit fullscreen
            </>
          ) : (
            <>
              <FiMaximize className="h-3.5 w-3.5" />
              Go fullscreen
            </>
          )}
        </button>
        <Link
          href="/editor"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:border-white/40 hover:bg-white/20"
        >
          <FiArrowLeft className="h-3.5 w-3.5" />
          Back to editor
        </Link>
      </div>

      <div className="flex min-h-screen items-center justify-center px-10 py-16">
        <div
          className="relative w-full max-w-[90vw] rounded-[38px] border border-white/15 bg-black/90 p-8 shadow-[0_0_60px_rgba(1,121,200,0.2)]"
          style={{
            aspectRatio: `${Math.max(geometry.widthIn, 1)} / ${Math.max(
              geometry.heightIn,
              1,
            )}`,
          }}
        >
          <div
            className="grid h-full w-full"
            style={{
              gridTemplateColumns: `repeat(${config.columns}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${config.rows}, minmax(0, 1fr))`,
              gap: `${config.gap}px`,
            }}
          >
            {orderedCells.map(([key, cell]) => {
              const placeholder = cell.componentId
                ? PLACEHOLDER_MAP[cell.componentId]
                : undefined;
              return (
                <div
                  key={key}
                  className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/5 text-white shadow-[inset_0_0_35px_rgba(12,154,235,0.16)]"
                  style={{
                    gridColumn: `span ${cell.colSpan ?? 1}`,
                    gridRow: `span ${cell.rowSpan ?? 1}`,
                  }}
                >
                  {placeholder ? (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-center">
                      <placeholder.icon className="h-10 w-10 text-white/90" />
                      <span className="text-sm font-semibold uppercase tracking-[0.24em] text-white/80">
                        {placeholder.label}
                      </span>
                      <span className="text-xs text-white/50">
                        Placeholder content
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] uppercase tracking-[0.32em] text-white/30">
                      Empty slot
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

