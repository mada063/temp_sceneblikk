"use client";

import type {
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
  type GridConfig,
  type PanelEntry,
} from "../../lib/layout-types";
import { PLACEHOLDER_MAP } from "../../lib/placeholders";
import type {
  DrawSelectionBounds,
  GridGeometry,
  GridItem,
  ResizeHandle,
} from "../types";

type CanvasPreviewProps = {
  canvasTitle: string;
  geometry: GridGeometry;
  config: GridConfig;
  gridItems: GridItem[];
  drawBounds: DrawSelectionBounds | null;
  selectedCell: string | null;
  gridRef: RefObject<HTMLDivElement | null>;
  onCanvasClick: () => void;
  onSelectCell: (key: string) => void;
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
  selectedCell,
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
          className="relative w-full max-w-4xl rounded-[36px] border border-white/30 bg-black/80 p-6 shadow-[inset_0_0_45px_rgba(12,154,235,0.25)] dark:border-white/10 dark:bg-black/70"
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
              const isSelected = selectedCell === key;
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
              const classes = [
                "group relative flex h-full w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/30 bg-white/10 p-3 text-center text-white transition hover:border-custom-color-300 hover:bg-custom-color-500/20",
                !cell.componentId ? "cursor-crosshair" : "cursor-default",
              ];
              if (isInSelection) {
                classes.push(
                  drawnSelectionIsValid
                    ? "border-custom-color-300/70 bg-custom-color-400/10 ring-2 ring-custom-color-400/60"
                    : "border-rose-400/80 bg-rose-500/10 ring-2 ring-rose-400/80",
                );
              } else if (isSelected) {
                classes.push("ring-2 ring-custom-color-400");
              }
              const className = classes.filter(Boolean).join(" ");
              const spanStyle = {
                gridColumn: `span ${cell.colSpan ?? 1}`,
                gridRow: `span ${cell.rowSpan ?? 1}`,
              } as const;

              let content: ReactNode;
              if (placeholder) {
                content = (
                  <div
                    draggable
                    onDragStart={onDragStartCell(key)}
                    className="flex h-full w-full cursor-grab flex-col items-center justify-center gap-3 rounded-xl bg-custom-color-500/20 p-3 text-white transition active:cursor-grabbing"
                  >
                    <placeholder.icon className="h-8 w-8" />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                      {placeholder.label}
                    </span>
                  </div>
                );
              } else if (isFreeform) {
                content = (
                  <div
                    draggable
                    onDragStart={onDragStartCell(key)}
                    className="flex h-full w-full cursor-grab flex-col items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 p-3 text-white transition active:cursor-grabbing"
                  >
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                      Panel
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.22em] text-white/60">
                      {panelEntryCount > 0
                        ? primaryPanelEntry?.label ?? panelEntries[0].componentId
                        : "Empty"}
                    </span>
                    {panelEntryCount > 1 ? (
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-white/60">
                        + {panelEntryCount - 1} more
                      </span>
                    ) : null}
                    <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">
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
                    onSelectCell(key);
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
                        className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] opacity-0 transition group-hover:opacity-100"
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

