"use client";

import type {
  CSSProperties,
  DragEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
  ReactNode,
} from "react";

import { FiTrash2 } from "react-icons/fi";

import {
  FREEFORM_COMPONENT_ID,
  parseKey,
} from "../utils/grid";
import {
  type CellAppearance,
  type GridConfig,
  type PanelEntry,
  makeDefaultAppearance,
} from "../../lib/layout-types";
import { PLACEHOLDER_MAP } from "../../lib/placeholders";
import type {
  DrawSelectionBounds,
  GridGeometry,
  GridItem,
  ResizeHandle,
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
  gridRef: RefObject<HTMLDivElement | null>;
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
};

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
}: CanvasPreviewProps) {
  return (
    <div className="glass-surface rounded-3xl border border-white/40 p-6 shadow-lg dark:border-white/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-custom-color-800 dark:text-custom-color-100">
            Canvas preview
          </h2>
          <p className="text-xs uppercase tracking-[0.28em] text-custom-color-600 dark:text-custom-color-200">
            {canvasTitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-custom-color-700/70 dark:text-custom-color-100/70">
          <div className="rounded-full bg-white/70 px-3 py-1 dark:bg-custom-color-800/70">
            {(geometry.widthIn * geometry.heightIn).toFixed(0)} in² surface
          </div>
          <div className="rounded-full bg-white/70 px-3 py-1 dark:bg-custom-color-800/70">
            ~{Math.round(geometry.widthPx)} px width
          </div>
          <div className="rounded-full bg-white/70 px-3 py-1 dark:bg-custom-color-800/70">
            {config.columns} × {config.rows} grid
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <div
          className="relative w-full max-w-4xl rounded-[36px] border border-custom-color-200/80 bg-white/95 p-6 shadow-[inset_0_0_45px_rgba(12,154,235,0.15)] transition-colors dark:border-white/10 dark:bg-black/70"
          onClick={onCanvasClick}
          style={{
            aspectRatio: `${Math.max(geometry.widthIn, 1)} / ${Math.max(
              geometry.heightIn,
              1,
            )}`,
          }}
        >
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
                spanStyle.backgroundColor = backgroundColor;
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

              let content: ReactNode;
              if (placeholder) {
                content = (
                  <div
                    draggable
                    onDragStart={onDragStartCell(key)}
                    className="flex h-full w-full cursor-grab flex-col items-center justify-center gap-3 rounded-xl bg-transparent p-3 transition active:cursor-grabbing"
                    style={{ color: textColor }}
                  >
                    <placeholder.icon className="h-8 w-8" style={{ color: textColor }} />
                    <span
                      className="text-xs font-semibold uppercase tracking-[0.18em]"
                      style={{ color: textColor }}
                    >
                      {placeholder.label}
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
                      Panel
                    </span>
                    <span
                      className="text-[10px] uppercase tracking-[0.22em]"
                      style={{ color: hexToRgba(textColor, 0.72) }}
                    >
                      {panelEntryCount > 0
                        ? primaryPanelEntry?.label ?? panelEntries[0].componentId
                        : "Empty"}
                    </span>
                    {panelEntryCount > 1 ? (
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.18em]"
                        style={{
                          backgroundColor: hexToRgba(textColor, 0.08),
                          color: hexToRgba(textColor, 0.68),
                        }}
                      >
                        + {panelEntryCount - 1} more
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
                  onPointerDown={onStartDraw(key)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={onDropOnCell(key)}
                  className={className}
                  style={spanStyle}
                >
                  {cell.componentId ? (
                    <>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onClearCell(key);
                        }}
                        className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] opacity-0 transition group-hover:opacity-100"
                        style={{
                          backgroundColor: hexToRgba(borderColor, 0.2),
                          color: textColor,
                        }}
                      >
                        <FiTrash2 className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onPointerDown={onStartResize(key, "ne")}
                        className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-full border border-white/40 bg-black/60 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow transition group-hover:flex"
                        aria-label="Resize component (top)"
                      >
                        <span aria-hidden="true">↕</span>
                      </button>
                      <button
                        type="button"
                        onPointerDown={onStartResize(key, "se")}
                        className="absolute bottom-2 right-2 hidden h-6 w-6 items-center justify-center rounded-full border border-white/40 bg-black/60 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow transition group-hover:flex"
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
        </div>
      </div>
    </div>
  );
}

