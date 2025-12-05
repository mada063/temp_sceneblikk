"use client";

import type {
  CSSProperties,
  DragEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
  ReactNode,
} from "react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

import { FiTrash2, FiPlus } from "react-icons/fi";

import {
  FREEFORM_COMPONENT_ID,
  parseKey,
  resolveRootKey,
  findNeighboringPanels,
  getConnectionGroup,
} from "../utils/grid";
import {
  type CellAppearance,
  type GridConfig,
  type GridCell,
  type PanelEntry,
  makeDefaultAppearance,
} from "../../lib/layout-types";
import { PLACEHOLDER_MAP } from "../../lib/placeholders";
import { useI18n } from "../../lib/i18n";
import type {
  DrawSelectionBounds,
  GridGeometry,
  GridItem,
  ResizeHandle,
  ConnectionState,
} from "../types";

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.trim().replace("#", "");
  const safe = normalized.length === 3
    ? normalized
        .split("")
        .map((char) => char + char)
        .join("")
    : normalized.padEnd(6, "0");
  const value = Number.parseInt(safe.slice(0, 6), 16);
  if (Number.isNaN(value)) {
    return `rgba(37, 99, 235, ${Math.min(Math.max(alpha, 0), 1)})`;
  }
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const safeAlpha = Math.min(Math.max(alpha, 0), 1);
  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
};

type CanvasPreviewProps = {
  canvasTitle: string;
  geometry: GridGeometry;
  config: GridConfig;
  gridItems: GridItem[];
  drawBounds: DrawSelectionBounds | null;
  selectedCells: string[];
  selectionCount: number;
  // RefObject<T> already has current: T | null, so we don't include null in T here
  gridRef: RefObject<HTMLDivElement>;
  onCanvasClick: () => void;
  onSelectCell: (key: string, options?: { multi?: boolean }) => void;
  onStartDraw: (
    key: string,
  ) => (event: ReactPointerEvent<HTMLDivElement>) => void;
  onDragStartCell: (
    key: string,
  ) => (event: DragEvent<HTMLDivElement>) => void;
  onDropOnCell: (
    key: string,
  ) => (event: DragEvent<HTMLDivElement>) => void;
  onClearCell: (key: string) => void;
  onStartResize: (
    key: string,
    handle: ResizeHandle,
  ) => (event: ReactPointerEvent<HTMLButtonElement>) => void;
  hoveredPanelKey: string | null;
  onHoverPanel: (key: string | null) => void;
  connectionState: ConnectionState;
  onStartConnection: (
    key: string,
  ) => (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onRemoveConnection: (key: string) => void;
  cells: Record<string, GridCell>;
};

// Loosely typed icon components to avoid react-icons vs local React type incompatibilities
const TrashIcon = FiTrash2 as React.ComponentType<{ className?: string }>;
const PlusIcon = FiPlus as React.ComponentType<{ className?: string }>;

export function CanvasPreview({
  canvasTitle,
  geometry,
  config,
  gridItems,
  drawBounds,
  selectedCells,
  selectionCount,
  gridRef,
  onCanvasClick,
  onSelectCell,
  onStartDraw,
  onDragStartCell,
  onDropOnCell,
  onClearCell,
  onStartResize,
  hoveredPanelKey,
  onHoverPanel,
  connectionState,
  onStartConnection,
  onRemoveConnection,
  cells,
}: CanvasPreviewProps) {
  const { t, locale } = useI18n();
  const [borderPosition, setBorderPosition] = useState<{ x: number; y: number; cellX: number; cellY: number } | null>(null);
  const hoveredCellRef = useRef<{ key: string; element: HTMLElement | null }>({ key: "", element: null });
  const [gridReady, setGridReady] = useState(false);
  const [isNearConnection, setIsNearConnection] = useState(false);

  // Helper to get the main connector's background color (first panel in connection group)
  const getMainConnectorColor = useCallback((connectionGroup: string[] | null): string | null => {
    if (!connectionGroup || connectionGroup.length === 0) return null;
    const mainKey = connectionGroup[0];
    const mainCell = cells[mainKey];
    if (!mainCell?.appearance?.backgroundColor) return null;
    return mainCell.appearance.backgroundColor;
  }, [cells]);

  // Calculate gap fillers between connected panels
  // Only fills the CSS grid gap areas where connected panels share an edge
  const connectionOverlays = useMemo(() => {
    if (!config.connections || config.connections.length === 0) return [];
    
    const gapRects: Array<{
      x: number; // Grid-relative X position
      y: number; // Grid-relative Y position
      width: number;
      height: number;
      backgroundColor: string;
    }> = [];

    for (const group of config.connections) {
      if (group.length < 2) continue;
      
      const mainColor = getMainConnectorColor(group);
      if (!mainColor) continue;
      const mainCell = cells[group[0]];
      
      // Get all panel positions
      const panels = group.map(rootKey => {
        const cell = cells[rootKey];
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
          // Panel A's right edge at column panelA.rightCol, Panel B's left edge at column panelB.column
          if (panelA.rightCol === panelB.column) {
            // Panel A is to the left of Panel B, gap is between them
            const sharedTop = Math.max(panelA.row, panelB.row);
            const sharedBottom = Math.min(panelA.bottomRow, panelB.bottomRow);
            if (sharedBottom > sharedTop) {
              // They share a vertical edge, add a vertical gap rectangle
              gapRects.push({
                x: panelA.rightCol, // Gap is at the column line
                y: sharedTop,
                width: 0, // Will be set to config.gap when rendering
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
                height: 0, // Will be set to config.gap when rendering
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
  }, [config.connections, cells, getMainConnectorColor]);

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
  }, [config, cells]);

  // Calculate closest point on panel border to mouse position
  // All coordinates should be relative to the grid container
  const calculateBorderPosition = useCallback((clientX: number, clientY: number, cellElement: HTMLElement, gridRect: DOMRect): { x: number; y: number } => {
    const cellRect = cellElement.getBoundingClientRect();
    
    // Get mouse position relative to grid
    const mouseX = clientX - gridRect.left;
    const mouseY = clientY - gridRect.top;
    
    // Get cell position relative to grid
    const cellLeft = cellRect.left - gridRect.left;
    const cellTop = cellRect.top - gridRect.top;
    const cellRight = cellLeft + cellRect.width;
    const cellBottom = cellTop + cellRect.height;
    
    // Calculate distance to each edge
    const distToLeft = Math.abs(mouseX - cellLeft);
    const distToRight = Math.abs(mouseX - cellRight);
    const distToTop = Math.abs(mouseY - cellTop);
    const distToBottom = Math.abs(mouseY - cellBottom);
    
    // Find closest edge
    const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
    
    let borderX: number;
    let borderY: number;
    
    if (minDist === distToLeft) {
      // Closest to left edge
      borderX = cellLeft;
      borderY = Math.max(cellTop, Math.min(cellBottom, mouseY));
    } else if (minDist === distToRight) {
      // Closest to right edge
      borderX = cellRight;
      borderY = Math.max(cellTop, Math.min(cellBottom, mouseY));
    } else if (minDist === distToTop) {
      // Closest to top edge
      borderX = Math.max(cellLeft, Math.min(cellRight, mouseX));
      borderY = cellTop;
    } else {
      // Closest to bottom edge
      borderX = Math.max(cellLeft, Math.min(cellRight, mouseX));
      borderY = cellBottom;
    }
    
    return { x: borderX, y: borderY };
  }, []);

  // Track mouse position when hovering over panels and calculate border position
  useEffect(() => {
    if (!hoveredPanelKey || connectionState) {
      setBorderPosition(null);
      setIsNearConnection(false);
      hoveredCellRef.current = { key: "", element: null };
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!gridRef.current) return;
      
      // Find the cell element for the hovered panel
      const cellElement = gridRef.current.querySelector<HTMLElement>(`[data-cell-key="${hoveredCellRef.current.key}"]`);
      if (!cellElement) {
        // Try to find it by searching for the root key
        const allCells = gridRef.current.querySelectorAll<HTMLElement>("[data-cell-key]");
        for (const cell of Array.from(allCells)) {
          const cellKey = cell.dataset.cellKey;
          if (cellKey) {
            const rootKey = resolveRootKey(cellKey, cells);
            if (rootKey === hoveredPanelKey) {
              hoveredCellRef.current = { key: cellKey, element: cell };
              break;
            }
          }
        }
      }
      
      const currentCell = hoveredCellRef.current.element;
      if (currentCell && gridRef.current) {
        const gridRect = gridRef.current.getBoundingClientRect();
        const cellRect = currentCell.getBoundingClientRect();
        const borderPos = calculateBorderPosition(
          event.clientX,
          event.clientY,
          currentCell,
          gridRect
        );
        // Calculate position relative to cell for button positioning
        const cellLeft = cellRect.left - gridRect.left;
        const cellTop = cellRect.top - gridRect.top;
        setBorderPosition({
          ...borderPos,
          cellX: borderPos.x - cellLeft,
          cellY: borderPos.y - cellTop,
        });

        // Check if mouse is near any connection gap
        const mouseX = event.clientX - gridRect.left;
        const mouseY = event.clientY - gridRect.top;
        const threshold = 20; // pixels - how close to be considered "near" a connection
        
        let nearConnection = false;
        for (const gapRect of connectionOverlays) {
          if (!gridRef.current) break;
          
          // Calculate actual pixel positions of the gap (matching the rendering logic)
          const cellWidth = (gridRect.width - (config.columns - 1) * config.gap) / config.columns;
          const cellHeight = (gridRect.height - (config.rows - 1) * config.gap) / config.rows;
          const halfCellWidth = cellWidth / 2;
          const halfCellHeight = cellHeight / 2;
          
          let x: number;
          let y: number;
          let width: number;
          let height: number;
          
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
          
          // Check if mouse is within threshold distance of the gap rectangle
          // Calculate distance from mouse to the nearest point on the rectangle
          const nearestX = Math.max(x, Math.min(mouseX, x + width));
          const nearestY = Math.max(y, Math.min(mouseY, y + height));
          const distance = Math.sqrt(
            (mouseX - nearestX) * (mouseX - nearestX) + 
            (mouseY - nearestY) * (mouseY - nearestY)
          );
          
          if (distance <= threshold) {
            nearConnection = true;
            break;
          }
        }
        
        setIsNearConnection(nearConnection);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [hoveredPanelKey, connectionState, gridRef, cells, calculateBorderPosition, connectionOverlays, config]);

  return (
    <div className="glass-surface rounded-3xl border border-white/40 p-6 shadow-lg dark:border-white/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-custom-color-800 dark:text-custom-color-100">
            {t("editor", "canvasPreviewTitle")}
          </h2>
          <p className="text-xs uppercase tracking-[0.28em] text-custom-color-600 dark:text-custom-color-200">
            {canvasTitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-custom-color-700/70 dark:text-custom-color-100/70">
          <div className="rounded-full bg-white/70 px-3 py-1 dark:bg-custom-color-800/70">
            {(geometry.widthIn * geometry.heightIn).toFixed(0)} in²{" "}
            {t("editor", "canvasSurfaceSuffix")}
          </div>
          <div className="rounded-full bg-white/70 px-3 py-1 dark:bg-custom-color-800/70">
            ~{Math.round(geometry.widthPx)} px{" "}
            {t("editor", "canvasWidthSuffix")}
          </div>
          <div className="rounded-full bg-white/70 px-3 py-1 dark:bg-custom-color-800/70">
            {config.columns} × {config.rows}{" "}
            {t("editor", "canvasGridSuffix")}
          </div>
          <div className="rounded-full bg-white/70 px-3 py-1 dark:bg-custom-color-800/70">
            {config.orientation === "landscape"
              ? t("editor", "orientationLandscapeLabel")
              : t("editor", "orientationPortraitLabel")}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <div
          className="relative w-full max-w-4xl rounded-[36px] border border-custom-color-200/80 p-6 shadow-[inset_0_0_45px_rgba(12,154,235,0.15)] transition-colors dark:border-white/10"
          onClick={onCanvasClick}
          style={{
            aspectRatio: `${Math.max(geometry.widthIn, 1)} / ${Math.max(
              geometry.heightIn,
              1,
            )}`,
            backgroundColor: config.backgroundColor ?? "#0a3d62",
          }}
        >
          <div className="relative h-full w-full">
            <div
              ref={gridRef}
              className="grid h-full w-full"
              style={{
                gridTemplateColumns: `repeat(${config.columns}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${config.rows}, minmax(0, 1fr))`,
                columnGap: `${config.gap}px`,
                rowGap: `${config.gap}px`,
              }}
            >
              {gridItems.map(({ key, cell }) => {
              const coords = parseKey(key);
              const rootKey = resolveRootKey(key, cells);
              const rootCell = cells[rootKey];
              const placeholder =
                cell.componentId && cell.componentId !== FREEFORM_COMPONENT_ID
                  ? PLACEHOLDER_MAP[cell.componentId]
                  : undefined;
              const isFreeform = cell.componentId === FREEFORM_COMPONENT_ID;
              const panelEntries = isFreeform ? cell.panelEntries ?? [] : [];
              const panelEntryCount = panelEntries.length;
              const primaryPanelEntry =
                panelEntryCount > 0
                  ? PLACEHOLDER_MAP[(panelEntries as PanelEntry[])[0].componentId]
                  : undefined;
              const isSelected = selectedCells.includes(key);
              const isHovered = hoveredPanelKey === rootKey && isFreeform;
              const connectionGroup = isFreeform
                ? getConnectionGroup(rootKey, config.connections)
                : null;
              const isConnecting = connectionState?.fromKey === rootKey;
              // Check if this panel is a neighbor of the connecting panel
              const isNeighborOfConnecting = connectionState && isFreeform
                ? (() => {
                    const neighbors = findNeighboringPanels(
                      connectionState.fromKey,
                      cells,
                      config,
                    );
                    return neighbors.includes(rootKey);
                  })()
                : false;
              let isInSelection = false;
              let drawnSelectionIsValid = false;
              if (drawBounds) {
                isInSelection =
                  coords.row >= drawBounds.minRow &&
                  coords.row <= drawBounds.maxRow &&
                  coords.column >= drawBounds.minColumn &&
                  coords.column <= drawBounds.maxColumn;
                drawnSelectionIsValid = drawBounds.isValid;
              }
              const isOccupied = Boolean(cell.componentId);
              const appearance: CellAppearance = cell.appearance
                ? { ...cell.appearance }
                : makeDefaultAppearance();
              const backgroundColor =
                appearance.backgroundColor && appearance.backgroundColor !== ""
                  ? appearance.backgroundColor
                  : "#2563eb";
              const borderColor =
                appearance.borderColor && appearance.borderColor !== ""
                  ? appearance.borderColor
                  : "#1d4ed8";
              const textColor =
                appearance.textColor && appearance.textColor !== ""
                  ? appearance.textColor
                  : "#ffffff";
              const classes = [
                "group relative flex h-full w-full flex-col items-center justify-center rounded-xl border p-3 text-center transition",
                isOccupied
                  ? "cursor-default"
                  : "cursor-crosshair border border-dashed border-custom-color-300/60 bg-white text-custom-color-700 shadow-sm hover:border-custom-color-400 hover:bg-custom-color-100/60 dark:border-white/30 dark:bg-white/10 dark:text-white",
              ];
              if (isInSelection) {
                classes.push(
                  drawnSelectionIsValid
                    ? "border-custom-color-300/70 bg-custom-color-400/10 ring-2 ring-custom-color-400/60"
                    : "border-rose-400/80 bg-rose-500/10 ring-2 ring-rose-400/80",
                );
              } else if (isSelected && !isOccupied && selectionCount <= 1) {
                classes.push("ring-2 ring-custom-color-400/80");
              }
              const className = classes.filter(Boolean).join(" ");
              const spanStyle: CSSProperties = {
                gridColumn: `span ${cell.colSpan ?? 1}`,
                gridRow: `span ${cell.rowSpan ?? 1}`,
                position: "relative",
                zIndex: 1,
              };
              if (isOccupied) {
                const borderStyle = appearance.borderWidth > 0 ? "solid" : "none";
                spanStyle.borderRadius = `${appearance.borderRadius}px`;
                spanStyle.borderWidth = appearance.borderWidth;
                spanStyle.borderStyle = borderStyle;
                if (borderStyle !== "none") {
                  spanStyle.borderColor = borderColor;
                } else {
                  spanStyle.borderColor = "transparent";
                }
                // If connected, use the main connector's background color
                if (connectionGroup && connectionGroup.length > 1) {
                  const mainColor = getMainConnectorColor(connectionGroup);
                  if (mainColor) {
                    spanStyle.backgroundColor = mainColor;
                  } else {
                    spanStyle.backgroundColor = backgroundColor;
                  }
                  // Add connection indicator - use a subtle outline
                  // This will be overridden by selection/connecting outlines if present
                  if (!isConnecting && !isNeighborOfConnecting && !isSelected) {
                    spanStyle.outline = "2px solid rgba(34, 211, 238, 0.5)";
                    spanStyle.outlineOffset = "2px";
                  }
                } else {
                  spanStyle.backgroundColor = backgroundColor;
                }
                if (isSelected) {
                  if (selectionCount > 1) {
                    spanStyle.boxShadow = `0 0 0 3px ${hexToRgba("#22d3ee", 0.55)}`;
                  } else {
                    spanStyle.boxShadow = `0 0 0 3px ${hexToRgba(borderColor, 0.45)}`;
                  }
                } else {
                  spanStyle.boxShadow = `0 16px 32px ${hexToRgba(borderColor, 0.28)}`;
                }
                spanStyle.color = textColor;
              }
              if (isSelected && selectionCount > 1) {
                spanStyle.outline = "2px dashed rgba(56,189,248,0.75)";
                spanStyle.outlineOffset = "6px";
              }
              if (isConnecting) {
                spanStyle.outline = "2px solid rgba(34, 211, 238, 0.8)";
                spanStyle.outlineOffset = "4px";
              }
              if (isNeighborOfConnecting) {
                spanStyle.outline = "2px dashed rgba(34, 211, 238, 0.6)";
                spanStyle.outlineOffset = "4px";
              }

              let content: ReactNode;
              if (placeholder) {
                const PlaceholderIcon = placeholder.icon as React.ComponentType<{
                  className?: string;
                  style?: CSSProperties;
                }>;
                content = (
                  <div
                    draggable
                    onDragStart={onDragStartCell(key)}
                    className="flex h-full w-full cursor-grab flex-col items-center justify-center gap-3 rounded-xl bg-transparent p-3 transition active:cursor-grabbing"
                    style={{ color: textColor }}
                  >
                    <PlaceholderIcon className="h-8 w-8" style={{ color: textColor }} />
                    <span
                      className="text-xs font-semibold uppercase tracking-[0.18em]"
                      style={{ color: textColor }}
                    >
                      {locale === "nb" && placeholder.labelNb
                        ? placeholder.labelNb
                        : placeholder.label}
                    </span>
                  </div>
                );
              } else if (isFreeform) {
                content = (
                  <div
                    draggable
                    onDragStart={onDragStartCell(key)}
                    className="flex h-full w-full cursor-grab flex-col items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 p-3 transition active:cursor-grabbing dark:border-white/20 dark:bg-white/5"
                    style={{ color: textColor }}
                  >
                    <span
                      className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                      style={{
                        backgroundColor: hexToRgba(textColor, 0.12),
                        color: textColor,
                      }}
                    >
                      {t("editor", "panelLabel")}
                    </span>
                    <span
                      className="text-[10px] uppercase tracking-[0.22em]"
                      style={{ color: hexToRgba(textColor, 0.72) }}
                    >
                      {panelEntryCount > 0
                        ? (() => {
                            if (!primaryPanelEntry) {
                              return panelEntries[0].componentId;
                            }
                            if (locale === "nb" && primaryPanelEntry.labelNb) {
                              return primaryPanelEntry.labelNb;
                            }
                            return primaryPanelEntry.label;
                          })()
                        : t("editor", "panelEmptyLabel")}
                    </span>
                    {panelEntryCount > 1 ? (
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.18em]"
                        style={{
                          backgroundColor: hexToRgba(textColor, 0.08),
                          color: hexToRgba(textColor, 0.68),
                        }}
                      >
                        + {panelEntryCount - 1}{" "}
                        {t("editor", "panelMoreSuffix")}
                      </span>
                    ) : null}
                    <span
                      className="text-[10px] uppercase tracking-[0.22em]"
                      style={{ color: hexToRgba(textColor, 0.56) }}
                    >
                      {`${cell.colSpan ?? 1} × ${cell.rowSpan ?? 1}`}
                    </span>
                  </div>
                );
              } else {
                content = <div className="h-full w-full" />;
              }

              return (
                <div
                  key={key}
                  data-cell-key={key}
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                  onSelectCell(key, { multi: event.shiftKey });
                  }}
                  onPointerDown={(e) => {
                    // Don't start drawing if we're in connection mode
                    // Allow pointer events to pass through so connection can complete
                    if (connectionState) {
                      // Don't prevent default - let pointer events work for connection
                      return;
                    }
                    onStartDraw(key)(e);
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={onDropOnCell(key)}
                  onMouseEnter={(e) => {
                    if (isFreeform) {
                      onHoverPanel(rootKey);
                      hoveredCellRef.current = { key, element: e.currentTarget };
                    }
                  }}
                  onMouseLeave={() => {
                    if (isFreeform && hoveredPanelKey === rootKey) {
                      onHoverPanel(null);
                      hoveredCellRef.current = { key: "", element: null };
                      setBorderPosition(null);
                    }
                  }}
                  className={className}
                  style={spanStyle as React.CSSProperties}
                >
                  {cell.componentId ? (
                    <>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onClearCell(key);
                        }}
                        className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] opacity-0 transition group-hover:opacity-100"
        
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                      {isFreeform && isHovered && !connectionState && borderPosition ? (
                        <button
                          type="button"
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (isNearConnection) {
                              onRemoveConnection(rootKey);
                            } else {
                              onStartConnection(key)(e);
                            }
                          }}
                          className="absolute z-10 inline-flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-custom-color-500 text-white shadow-lg transition hover:bg-custom-color-400"
                          aria-label={isNearConnection ? "Disconnect panel" : "Connect panel"}
                          style={{
                            pointerEvents: "auto",
                            left: `${borderPosition.cellX}px`,
                            top: `${borderPosition.cellY}px`,
                          }}
                          >
                            {isNearConnection ? (
                              <span className="text-lg leading-none">×</span>
                            ) : (
                              <PlusIcon className="h-4 w-4" />
                            )}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onPointerDown={onStartResize(key, "ne")}
                        className="absolute right-2 top-2 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-white/40 bg-black/60 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow transition group-hover:flex"
                        aria-label="Resize component (top)"
                      >
                        <span aria-hidden="true">↕</span>
                      </button>
                      <button
                        type="button"
                        onPointerDown={onStartResize(key, "se")}
                        className="absolute bottom-2 right-2 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-white/40 bg-black/60 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow transition group-hover:flex"
                        aria-label="Resize component"
                      >
                        <span aria-hidden="true">⤢</span>
                      </button>
                    </>
                  ) : null}
                  {content}
                </div>
              );
            })}
            </div>
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
            {/* Connection indicator line */}
            {connectionState && gridRef.current ? (
              <svg
                className="pointer-events-none absolute left-0 top-0 z-50"
                style={{ 
                  width: gridRef.current.offsetWidth,
                  height: gridRef.current.offsetHeight,
                }}
              >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3, 0 6"
                    fill="rgba(34, 211, 238, 0.8)"
                  />
                </marker>
              </defs>
              {(() => {
                const gridRect = gridRef.current?.getBoundingClientRect();
                if (!gridRect) return null;
                
                // Use the border position where the connection started
                const fromX = connectionState.borderX;
                const fromY = connectionState.borderY;
                const toX = connectionState.mouseX - gridRect.left;
                const toY = connectionState.mouseY - gridRect.top;
                
                return (
                  <line
                    x1={fromX}
                    y1={fromY}
                    x2={toX}
                    y2={toY}
                    stroke="rgba(34, 211, 238, 0.8)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })()}
              </svg>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

