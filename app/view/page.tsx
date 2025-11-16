'use client';

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiMaximize,
  FiMinimize,
  FiMonitor,
} from "react-icons/fi";
import { useAuth } from "../lib/auth-context";
import { updateDeviceHeartbeat, getLayout } from "../lib/firestore";
import {
  GridCell,
  GridConfig,
  LAYOUT_STORAGE_KEY,
  PersistedLayoutState,
  createEmptyGrid,
  deriveGridGeometry,
  enforceGridCapacity,
  normalizeConfig,
  makeDefaultAppearance,
  cloneAppearance,
  type GridGeometry,
  type CellAppearance,
} from "../lib/layout-types";
import { FREEFORM_COMPONENT_ID } from "../editor/utils/grid";
import { ComponentRenderer } from "./components/ComponentRenderer";
import { PanelCell } from "./components/PanelCell";

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
  const { user } = useAuth();
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [cursorHidden, setCursorHidden] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layoutId, setLayoutId] = useState<string | null>(null);
  const [layoutName, setLayoutName] = useState<string | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const deviceIdRef = useRef<string | null>(null);

  // Initialize device ID
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!deviceIdRef.current) {
      let stored = localStorage.getItem("sceneblikk-device-id");
      if (!stored) {
        stored = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("sceneblikk-device-id", stored);
      }
      deviceIdRef.current = stored;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const loadLayout = async () => {
      try {
        // Try to get layout ID from URL params or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const layoutIdParam = urlParams.get("layoutId");
        
        if (layoutIdParam && user) {
          // Load from Firestore
          const layout = await getLayout(layoutIdParam);
          if (layout) {
            setLayoutId(layout.id);
            setLayoutName(layout.name);
            const normalizedConfig = enforceGridCapacity(
              normalizeConfig(layout.config),
            );
            const geometry = deriveGridGeometry({
              screenInches: normalizedConfig.screenInches,
              orientation: normalizedConfig.orientation,
            });
            const baseline = createEmptyGrid(
              normalizedConfig.rows,
              normalizedConfig.columns,
            );
            for (const key of Object.keys(baseline)) {
              if (layout.cells[key]) {
                baseline[key] = layout.cells[key];
              }
            }
            setPlayerState({
              config: normalizedConfig,
              geometry,
              cells: baseline,
            });
            return;
          }
        }

        // Fallback to localStorage
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
    };
    loadLayout();
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    let inactivityTimer: ReturnType<typeof setTimeout>;
    const INACTIVITY_DELAY = 5000; // 5 seconds
    
    const resetTimer = () => {
      // Show cursor and controls on any movement
      setCursorHidden(false);
      setControlsVisible(true);
      clearTimeout(inactivityTimer);
      // Hide both after inactivity
      inactivityTimer = setTimeout(() => {
        setCursorHidden(true);
        setControlsVisible(false);
      }, INACTIVITY_DELAY);
    };
    
    // Initialize: show controls and cursor initially
    resetTimer();
    
    // Track movement events for cross-platform compatibility
    // pointermove works for mouse, touch, and pen across all browsers
    const events = [
      "mousemove",      // Traditional mouse (all browsers)
      "pointermove",    // Modern pointer events (all browsers, better for touch)
      "touchstart",     // Touch devices (iOS, Android)
      "touchmove",      // Touch drag (iOS, Android)
      "mousedown",      // Mouse click (all browsers)
      "keydown",        // Keyboard interaction (accessibility)
      "wheel",          // Mouse wheel (all browsers)
    ];
    
    // Add all event listeners
    events.forEach((eventType) => {
      window.addEventListener(eventType, resetTimer, { passive: true });
    });
    
    return () => {
      clearTimeout(inactivityTimer);
      // Remove all event listeners
      events.forEach((eventType) => {
        window.removeEventListener(eventType, resetTimer);
      });
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

  // Heartbeat effect - send status updates when in fullscreen
  useEffect(() => {
    if (!user || !deviceIdRef.current || !isFullscreen) {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      return;
    }

    const sendHeartbeat = async () => {
      try {
        const deviceName = localStorage.getItem("sceneblikk-device-name") || 
          `Device ${deviceIdRef.current?.substr(-8)}`;
        await updateDeviceHeartbeat(
          user.uid,
          deviceIdRef.current!,
          deviceName,
          layoutId,
          layoutName,
          isFullscreen,
        );
      } catch (error) {
        console.error("Failed to send heartbeat:", error);
      }
    };

    // Send immediately
    sendHeartbeat();

    // Then send every 30 seconds
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, 30000);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [user, isFullscreen, layoutId, layoutName]);

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
    // Only show root cells (cells that are not covered by other cells)
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
      {/* Control bar - positioned above content, shows/hides on mouse movement */}
      <div
        className={`fixed left-1/2 top-6 z-50 flex -translate-x-1/2 flex-wrap items-center justify-center gap-4 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl transition-opacity duration-300 ${
          controlsVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
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

      <div className="flex min-h-screen items-center justify-center">
        <div
          className="relative w-full max-w-[100vw] max-h-[100vh] p-4"
          style={{
            aspectRatio: `${Math.max(geometry.widthIn, 1)} / ${Math.max(
              geometry.heightIn,
              1,
            )}`,
            backgroundColor: config.backgroundColor ?? "#0a3d62",
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
              // Empty cells: render invisible placeholder to maintain grid position
              if (!cell.componentId) {
                return (
                  <div
                    key={key}
                    style={{
                      gridColumn: `span ${cell.colSpan ?? 1}`,
                      gridRow: `span ${cell.rowSpan ?? 1}`,
                    }}
                  />
                );
              }

              // Get appearance settings or use defaults
              const appearance: CellAppearance = cell.appearance
                ? cloneAppearance(cell.appearance) ?? makeDefaultAppearance()
                : makeDefaultAppearance();

              // Apply appearance styles
              const backgroundColor =
                appearance.backgroundColor && appearance.backgroundColor !== ""
                  ? appearance.backgroundColor
                  : "#0a3d62";
              const borderColor =
                appearance.borderColor && appearance.borderColor !== ""
                  ? appearance.borderColor
                  : "rgba(255, 255, 255, 0.15)";
              const textColor =
                appearance.textColor && appearance.textColor !== ""
                  ? appearance.textColor
                  : "#ffffff";

              const borderStyle =
                appearance.borderWidth > 0 ? "solid" : "none";
              const borderWidth = appearance.borderWidth;
              const borderRadius = appearance.borderRadius;

              // Handle panel cycling for freeform components
              const isPanel = cell.componentId === FREEFORM_COMPONENT_ID;
              const panelEntries = isPanel ? cell.panelEntries ?? [] : [];

              return (
                <div
                  key={key}
                  className="relative flex h-full w-full items-center justify-center overflow-hidden text-white"
                  style={{
                    gridColumn: `span ${cell.colSpan ?? 1}`,
                    gridRow: `span ${cell.rowSpan ?? 1}`,
                    backgroundColor,
                    borderColor: borderStyle !== "none" ? borderColor : "transparent",
                    borderWidth,
                    borderStyle,
                    borderRadius: `${borderRadius}px`,
                    boxShadow: "inset 0 0 35px rgba(12,154,235,0.16)",
                  }}
                >
                  {isPanel && panelEntries.length > 0 ? (
                    <PanelCell
                      panelEntries={panelEntries}
                      appearance={appearance}
                    />
                  ) : (
                    <ComponentRenderer
                      componentId={cell.componentId}
                      appearance={appearance}
                    />
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

