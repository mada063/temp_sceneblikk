import type { GridCell } from "../lib/layout-types";

export type GridGeometry = {
  aspectRatio: number;
  widthIn: number;
  heightIn: number;
  widthPx: number;
  heightPx: number;
  maxSlots: number;
};

export type ResizeHandle = "se" | "ne" | "sw" | "nw";

export type ResizeState = {
  rootKey: string;
  originalColSpan: number;
  originalRowSpan: number;
  handle: ResizeHandle;
  initialTop: number;
  initialLeft: number;
  initialBottom: number;
  initialRight: number;
} | null;

export type DrawState = {
  anchorRow: number;
  anchorColumn: number;
  currentRow: number;
  currentColumn: number;
};

export type DrawSelectionBounds = {
  minRow: number;
  maxRow: number;
  minColumn: number;
  maxColumn: number;
  rootKey: string;
  colSpan: number;
  rowSpan: number;
  isValid: boolean;
};

export type GridItem = {
  key: string;
  cell: GridCell;
};

export type ConnectionState = {
  fromKey: string;
  borderX: number;
  borderY: number;
  mouseX: number;
  mouseY: number;
} | null;

