'use client';

import { useEffect, useMemo, useState, useRef, type CSSProperties } from "react";
import Link from "next/link";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiMaximize,
  FiMinimize,
  FiMonitor,
  FiSettings,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../lib/auth-context";
import { updateDeviceHeartbeat, getLayout, startViewSession, endViewSession } from "../lib/firestore";
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
import { FREEFORM_COMPONENT_ID, resolveRootKey, getConnectionGroup } from "../editor/utils/grid";
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
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [deviceNameDraft, setDeviceNameDraft] = useState("");
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const deviceIdRef = useRef<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridReady, setGridReady] = useState(false);
  const currentSessionIdRef = useRef<string | null>(null);
  const previousLayoutIdRef = useRef<string | null>(null);

  // Initialize device ID and load device name
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
    // Load device name from localStorage
    const storedName = localStorage.getItem("sceneblikk-device-name");
    if (storedName) {
      setDeviceNameDraft(storedName);
    }
  }, []);

  // Track when grid is ready for rendering connectors
  useEffect(() => {
    if (!gridRef.current) {
      setGridReady(false);
      return;
    }
    
    const checkGridReady = () => {
      if (gridRef.current) {
        const rect = gridRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setGridReady(true);
        }
      }
    };
    
    // Check immediately
    checkGridReady();
    
    // Also check after a short delay to ensure layout is complete
    const timeout = setTimeout(checkGridReady, 0);
    
    // Use ResizeObserver to detect when grid size changes
    const resizeObserver = new ResizeObserver(() => {
      checkGridReady();
    });
    
    if (gridRef.current) {
      resizeObserver.observe(gridRef.current);
    }
    
    return () => {
      clearTimeout(timeout);
      resizeObserver.disconnect();
    };
  }, [playerState]);

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
    const handleFullscreenChange = async () => {
      const newFullscreenState = Boolean(document.fullscreenElement);
      setIsFullscreen(newFullscreenState);
      
      // Track engagement: start session when entering fullscreen, end when exiting
      if (user && deviceIdRef.current) {
        if (newFullscreenState && !currentSessionIdRef.current) {
          // Entering fullscreen - start session
          try {
            const deviceName = localStorage.getItem("sceneblikk-device-name") || 
              `Device ${deviceIdRef.current?.substr(-8)}`;
            const sessionId = await startViewSession(
              user.uid,
              deviceIdRef.current,
              deviceName,
              layoutId,
              layoutName,
              true,
            );
            currentSessionIdRef.current = sessionId;
          } catch (error) {
            console.error("Failed to start view session:", error);
          }
        } else if (!newFullscreenState && currentSessionIdRef.current) {
          // Exiting fullscreen - end session
          try {
            await endViewSession(currentSessionIdRef.current);
            currentSessionIdRef.current = null;
          } catch (error) {
            console.error("Failed to end view session:", error);
          }
        }
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [user, layoutId, layoutName]);
  
  // Track layout changes
  useEffect(() => {
    if (user && deviceIdRef.current && layoutId && layoutId !== previousLayoutIdRef.current) {
      // Layout changed - end previous session if exists, start new one if fullscreen
      const handleLayoutChange = async () => {
        if (currentSessionIdRef.current && previousLayoutIdRef.current) {
          try {
            await endViewSession(currentSessionIdRef.current);
            currentSessionIdRef.current = null;
          } catch (error) {
            console.error("Failed to end session on layout change:", error);
          }
        }
        
        if (isFullscreen && !currentSessionIdRef.current) {
          try {
            const deviceName = localStorage.getItem("sceneblikk-device-name") || 
              `Device ${deviceIdRef.current?.substr(-8)}`;
            const sessionId = await startViewSession(
              user.uid,
              deviceIdRef.current,
              deviceName,
              layoutId,
              layoutName,
              true,
            );
            currentSessionIdRef.current = sessionId;
          } catch (error) {
            console.error("Failed to start session on layout change:", error);
          }
        }
        
        previousLayoutIdRef.current = layoutId;
      };
      
      handleLayoutChange();
    } else if (!previousLayoutIdRef.current && layoutId) {
      previousLayoutIdRef.current = layoutId;
    }
  }, [user, layoutId, layoutName, isFullscreen]);
  
  // Cleanup: end session on unmount
  useEffect(() => {
    return () => {
      if (currentSessionIdRef.current) {
        endViewSession(currentSessionIdRef.current).catch(console.error);
      }
    };
  }, []);

  // Heartbeat effect - send status updates periodically to keep device active
  useEffect(() => {
    if (!user || !deviceIdRef.current) {
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

    // Also update device name draft if localStorage changes
    const storedName = localStorage.getItem("sceneblikk-device-name");
    if (storedName && storedName !== deviceNameDraft) {
      setDeviceNameDraft(storedName);
    }

    // Send immediately
    sendHeartbeat();

    // Then send every 30 seconds (even when not fullscreen to show device status)
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, 30000);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [user, isFullscreen, layoutId, layoutName, deviceNameDraft]);

  const handleSaveDeviceName = () => {
    if (typeof window === "undefined") return;
    const name = deviceNameDraft.trim() || `Device ${deviceIdRef.current?.substr(-8)}`;
    localStorage.setItem("sceneblikk-device-name", name);
    setShowDeviceSettings(false);
    // Trigger heartbeat update with new name
    if (user && deviceIdRef.current) {
      updateDeviceHeartbeat(
        user.uid,
        deviceIdRef.current,
        name,
        layoutId,
        layoutName,
        isFullscreen,
      ).catch(console.error);
    }
  };

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

  // Calculate gap fillers between connected panels
  // Only fills the CSS grid gap areas where connected panels share an edge
  const connectionOverlays = useMemo(() => {
    if (!playerState?.config.connections || playerState.config.connections.length === 0) {
      return [];
    }
    
    const gapRects: Array<{
      x: number; // Grid-relative X position (column)
      y: number; // Grid-relative Y position (row)
      width: number; // Width in grid units (0 for vertical gaps)
      height: number; // Height in grid units (0 for horizontal gaps)
      backgroundColor: string;
    }> = [];

    for (const group of playerState.config.connections) {
      if (group.length < 2) continue;
      
      // Get main connector color (first panel in group)
      const mainKey = group[0];
      const mainCell = playerState.cells[mainKey];
      const mainColor = mainCell?.appearance?.backgroundColor || "#0a3d62";
      
      // Get all panel positions
      const panels = group.map(rootKey => {
        const cell = playerState.cells[rootKey];
        if (!cell) return null;
        const { row, column } = parseKey(rootKey);
        return {
          rootKey,
          row,
          column,
          colSpan: cell.colSpan ?? 1,
          rowSpan: cell.rowSpan ?? 1,
          rightCol: column + (cell.colSpan ?? 1),
          bottomRow: row + (cell.rowSpan ?? 1),
        };
      }).filter(Boolean) as Array<{
        rootKey: string;
        row: number;
        column: number;
        colSpan: number;
        rowSpan: number;
        rightCol: number;
        bottomRow: number;
      }>;
      
      // Find vertical gaps (between columns) where panels share an edge
      for (let i = 0; i < panels.length; i++) {
        for (let j = i + 1; j < panels.length; j++) {
          const panelA = panels[i];
          const panelB = panels[j];
          
          // Check if they share a vertical edge (one panel's right edge touches another's left edge)
          if (panelA.rightCol === panelB.column) {
            // Panel A is to the left of Panel B, gap is between them
            const sharedTop = Math.max(panelA.row, panelB.row);
            const sharedBottom = Math.min(panelA.bottomRow, panelB.bottomRow);
            if (sharedBottom > sharedTop) {
              gapRects.push({
                x: panelA.rightCol, // Gap is at the column line
                y: sharedTop,
                width: 0, // Vertical gap
                height: sharedBottom - sharedTop,
                backgroundColor: mainColor,
              });
            }
          } else if (panelB.rightCol === panelA.column) {
            // Panel B is to the left of Panel A
            const sharedTop = Math.max(panelA.row, panelB.row);
            const sharedBottom = Math.min(panelA.bottomRow, panelB.bottomRow);
            if (sharedBottom > sharedTop) {
              gapRects.push({
                x: panelB.rightCol,
                y: sharedTop,
                width: 0,
                height: sharedBottom - sharedTop,
                backgroundColor: mainColor,
              });
            }
          }
          
          // Check if they share a horizontal edge (one panel's bottom edge touches another's top edge)
          if (panelA.bottomRow === panelB.row) {
            // Panel A is above Panel B, gap is between them
            const sharedLeft = Math.max(panelA.column, panelB.column);
            const sharedRight = Math.min(panelA.rightCol, panelB.rightCol);
            if (sharedRight > sharedLeft) {
              gapRects.push({
                x: sharedLeft,
                y: panelA.bottomRow, // Gap is at the row line
                width: sharedRight - sharedLeft,
                height: 0, // Horizontal gap
                backgroundColor: mainColor,
              });
            }
          } else if (panelB.bottomRow === panelA.row) {
            // Panel B is above Panel A
            const sharedLeft = Math.max(panelA.column, panelB.column);
            const sharedRight = Math.min(panelA.rightCol, panelB.rightCol);
            if (sharedRight > sharedLeft) {
              gapRects.push({
                x: sharedLeft,
                y: panelB.bottomRow,
                width: sharedRight - sharedLeft,
                height: 0,
                backgroundColor: mainColor,
              });
            }
          }
        }
      }
    }
    
    return gapRects;
  }, [playerState?.config.connections, playerState?.cells]);

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
        <button
          type="button"
          onClick={() => setShowDeviceSettings(true)}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:border-white/40 hover:bg-white/20"
        >
          <FiSettings className="h-3.5 w-3.5" />
          Device name
        </button>
        <Link
          href="/editor"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:border-white/40 hover:bg-white/20"
        >
          <FiArrowLeft className="h-3.5 w-3.5" />
          Back to editor
        </Link>
      </div>

      {/* Device Settings Modal */}
      {showDeviceSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setShowDeviceSettings(false)}
        >
          <div
            className="glass-surface w-full max-w-md rounded-3xl border border-white/30 p-6 shadow-xl dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Device Settings</h3>
              <button
                type="button"
                onClick={() => setShowDeviceSettings(false)}
                className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="deviceName"
                  className="mb-2 block text-sm font-semibold text-white/90"
                >
                  Device Name
                </label>
                <input
                  id="deviceName"
                  type="text"
                  value={deviceNameDraft}
                  onChange={(e) => setDeviceNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveDeviceName();
                    }
                  }}
                  placeholder={`Device ${deviceIdRef.current?.substr(-8)}`}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/50 transition focus:border-white/40 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <p className="mt-2 text-xs text-white/60">
                  This name will appear in the dashboard for easy identification.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveDeviceName}
                  className="flex-1 rounded-full bg-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/30"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeviceSettings(false)}
                  className="flex-1 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            ref={gridRef}
            className="relative grid h-full w-full"
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

              const rootKey = resolveRootKey(key, playerState.cells);
              const connectionGroup = cell.componentId === FREEFORM_COMPONENT_ID
                ? getConnectionGroup(rootKey, playerState.config.connections)
                : null;

              // Get appearance settings or use defaults
              const appearance: CellAppearance = cell.appearance
                ? cloneAppearance(cell.appearance) ?? makeDefaultAppearance()
                : makeDefaultAppearance();

              // If connected, use the main connector's background color
              let backgroundColor =
                appearance.backgroundColor && appearance.backgroundColor !== ""
                  ? appearance.backgroundColor
                  : "#0a3d62";
              
              if (connectionGroup && connectionGroup.length > 1) {
                // Get the main connector's background color (first panel in group)
                const mainKey = connectionGroup[0];
                const mainCell = playerState.cells[mainKey];
                if (mainCell?.appearance?.backgroundColor) {
                  backgroundColor = mainCell.appearance.backgroundColor;
                }
              }
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

              // Disable box-shadow in view to avoid showing through connectors
              const connectionStyle: React.CSSProperties = {
                boxShadow: "none",
              };

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
                    position: "relative",
                    zIndex: 1,
                    ...connectionStyle,
                  }}
                >
                  {isPanel && panelEntries.length > 0 ? (
                    <PanelCell
                      panelEntries={panelEntries}
                      appearance={appearance}
                      colSpan={cell.colSpan}
                      rowSpan={cell.rowSpan}
                      totalGridSize={config.columns * config.rows}
                    />
                  ) : (
                    <ComponentRenderer
                      componentId={cell.componentId}
                      appearance={appearance}
                      colSpan={cell.colSpan}
                      rowSpan={cell.rowSpan}
                      totalGridSize={config.columns * config.rows}
                    />
                  )}
                </div>
              );
            })}
            {/* Connection gap fillers - fill gaps between connected panels */}
            {gridReady && connectionOverlays.map((gapRect, idx) => {
              if (!gridRef.current) return null;
              
              // Calculate positions relative to grid
              const gridRect = gridRef.current.getBoundingClientRect();
              // Account for gaps in cell size calculation
              // CSS Grid with 1fr columns: (totalWidth - (columns-1) * gap) / columns
              const cellWidth = (gridRect.width - (config.columns - 1) * config.gap) / config.columns;
              const cellHeight = (gridRect.height - (config.rows - 1) * config.gap) / config.rows;
              
              // Convert grid coordinates to pixel positions
              // Connectors extend half a cell size into the panels
              // If width is 0, it's a vertical gap (between columns)
              // If height is 0, it's a horizontal gap (between rows)
              let x: number;
              let y: number;
              let width: number;
              let height: number;
              
              const halfCellWidth = cellWidth / 2;
              const halfCellHeight = cellHeight / 2;
              
              if (gapRect.width === 0) {
                // Vertical gap: between columns
                // Gap is at column line gapRect.x (between column gapRect.x-1 and gapRect.x)
                // Extend half a cell width into each panel
                x = gapRect.x * (cellWidth + config.gap) - config.gap - halfCellWidth;
                width = config.gap + (halfCellWidth * 2);
                // Y spans from row gapRect.y for gapRect.height rows
                y = gapRect.y * (cellHeight + config.gap);
                height = gapRect.height * (cellHeight + config.gap) - config.gap;
              } else {
                // Horizontal gap: between rows
                // Gap is at row line gapRect.y (between row gapRect.y-1 and gapRect.y)
                // Extend half a cell height into each panel
                y = gapRect.y * (cellHeight + config.gap) - config.gap - halfCellHeight;
                height = config.gap + (halfCellHeight * 2);
                // X spans from column gapRect.x for gapRect.width columns
                x = gapRect.x * (cellWidth + config.gap);
                width = gapRect.width * (cellWidth + config.gap) - config.gap;
              }
              
              return (
                <div
                  key={`connection-gap-${idx}`}
                  className="pointer-events-none absolute"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                    backgroundColor: gapRect.backgroundColor,
                    zIndex: 0,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

