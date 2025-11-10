import {
  GRID_LIMITS,
  type GridCell,
  type GridConfig,
  type PanelEntry,
  adjustGridToCapacity,
  deriveGridGeometry,
  makeCellKey,
} from "../../lib/layout-types";

export const FREEFORM_COMPONENT_ID = "freeform-region";
const DEFAULT_PANEL_ENTRY_DURATION = 10;

export const clampInt = (value: number, min: number, max: number) =>
  Math.min(Math.max(Math.round(value), min), max);

export const clampFloat = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const parseKey = (key: string) => {
  const [rowRaw, columnRaw] = key.split("-");
  const row = Number.parseInt(rowRaw, 10);
  const column = Number.parseInt(columnRaw, 10);
  return {
    row: Number.isFinite(row) ? row : 0,
    column: Number.isFinite(column) ? column : 0,
  };
};

export const resolveRootKey = (
  key: string,
  grid: Record<string, GridCell>,
): string => grid[key]?.coveredBy ?? key;

export const isAreaWithinBounds = (
  key: string,
  colSpan: number,
  rowSpan: number,
  config: GridConfig,
) => {
  const { row, column } = parseKey(key);
  return (
    row >= 0 &&
    column >= 0 &&
    column + colSpan <= config.columns &&
    row + rowSpan <= config.rows
  );
};

export const isAreaAvailable = (
  draft: Record<string, GridCell>,
  key: string,
  colSpan: number,
  rowSpan: number,
  config: GridConfig,
) => {
  if (!isAreaWithinBounds(key, colSpan, rowSpan, config)) {
    return false;
  }
  const { row, column } = parseKey(key);
  for (let y = 0; y < rowSpan; y += 1) {
    for (let x = 0; x < colSpan; x += 1) {
      const testKey = makeCellKey(row + y, column + x);
      const cell = draft[testKey];
      if (!cell) {
        continue;
      }
      if (testKey === key) {
        continue;
      }
      if (cell.coveredBy && cell.coveredBy !== key) {
        return false;
      }
      if (cell.componentId && cell.coveredBy !== key) {
        return false;
      }
    }
  }
  return true;
};

const createPanelEntryId = () =>
  `panel-entry-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

export const createPanelEntry = (componentId: string): PanelEntry => ({
  id: createPanelEntryId(),
  componentId,
  duration: DEFAULT_PANEL_ENTRY_DURATION,
});

export const clonePanelEntries = (entries?: PanelEntry[]) =>
  entries ? entries.map((entry) => ({ ...entry })) : [];

export const clearComponentRegion = (
  key: string,
  draft: Record<string, GridCell>,
) => {
  const root = draft[key];
  if (!root) {
    return;
  }
  const colSpan = root.colSpan ?? 1;
  const rowSpan = root.rowSpan ?? 1;
  const { row, column } = parseKey(key);

  for (let y = 0; y < rowSpan; y += 1) {
    for (let x = 0; x < colSpan; x += 1) {
      const currentKey = makeCellKey(row + y, column + x);
      const cell = draft[currentKey];
      if (!cell) {
        continue;
      }
      if (currentKey === key) {
        cell.componentId = null;
        cell.colSpan = 1;
        cell.rowSpan = 1;
        cell.coveredBy = null;
        cell.panelEntries = [];
      } else if (cell.coveredBy === key) {
        draft[currentKey] = {
          componentId: null,
          colSpan: 1,
          rowSpan: 1,
          coveredBy: null,
          panelEntries: [],
        };
      }
    }
  }
};

export const assignComponentToRegion = (
  key: string,
  draft: Record<string, GridCell>,
  config: GridConfig,
  componentId: string,
  colSpan: number,
  rowSpan: number,
) => {
  const { row, column } = parseKey(key);
  const maxColSpan = Math.max(1, config.columns - column);
  const maxRowSpan = Math.max(1, config.rows - row);
  const normalizedColSpan = clampInt(colSpan, 1, maxColSpan);
  const normalizedRowSpan = clampInt(rowSpan, 1, maxRowSpan);

  const root = draft[key] ?? {
    componentId: null,
    colSpan: 1,
    rowSpan: 1,
    coveredBy: null,
    panelEntries: [],
  };
  root.componentId = componentId;
  root.colSpan = normalizedColSpan;
  root.rowSpan = normalizedRowSpan;
  root.coveredBy = null;
  if (componentId === FREEFORM_COMPONENT_ID) {
    root.panelEntries = root.panelEntries ?? [];
  } else {
    root.panelEntries = [];
  }
  draft[key] = root;

  for (let y = 0; y < normalizedRowSpan; y += 1) {
    for (let x = 0; x < normalizedColSpan; x += 1) {
      const currentKey = makeCellKey(row + y, column + x);
      if (!draft[currentKey]) {
        draft[currentKey] = {
          componentId: null,
          colSpan: 1,
          rowSpan: 1,
          coveredBy: null,
          panelEntries: [],
        };
      }
      if (currentKey === key) {
        draft[currentKey].componentId = componentId;
        draft[currentKey].colSpan = normalizedColSpan;
        draft[currentKey].rowSpan = normalizedRowSpan;
        draft[currentKey].coveredBy = null;
        if (componentId === FREEFORM_COMPONENT_ID) {
          draft[currentKey].panelEntries = draft[currentKey].panelEntries ?? [];
        } else {
          draft[currentKey].panelEntries = [];
        }
      } else {
        draft[currentKey].componentId = null;
        draft[currentKey].colSpan = 1;
        draft[currentKey].rowSpan = 1;
        draft[currentKey].coveredBy = key;
        draft[currentKey].panelEntries = [];
      }
    }
  }
};

export const extractRootComponents = (grid: Record<string, GridCell>) =>
  Object.entries(grid)
    .filter(([, cell]) => cell.componentId && !cell.coveredBy)
    .map(([key, cell]) => ({
      key,
      componentId: cell.componentId as string,
      colSpan: cell.colSpan ?? 1,
      rowSpan: cell.rowSpan ?? 1,
      panelEntries: clonePanelEntries(cell.panelEntries),
    }))
    .sort((a, b) => {
      const coordsA = parseKey(a.key);
      const coordsB = parseKey(b.key);
      if (coordsA.row === coordsB.row) {
        return coordsA.column - coordsB.column;
      }
      return coordsA.row - coordsB.row;
    });

export const findMaxGridWithinCapacity = (
  maxSlots: number,
  orientation: GridConfig["orientation"],
) => {
  let bestColumns = GRID_LIMITS.min;
  let bestRows = GRID_LIMITS.min;
  let bestArea = GRID_LIMITS.min * GRID_LIMITS.min;

  for (let columns = GRID_LIMITS.min; columns <= GRID_LIMITS.maxColumns; columns += 1) {
    for (let rows = GRID_LIMITS.min; rows <= GRID_LIMITS.maxRows; rows += 1) {
      const area = columns * rows;
      if (area > maxSlots) {
        continue;
      }
      const isBetterArea = area > bestArea;
      const isTie =
        area === bestArea &&
        (orientation === "landscape"
          ? columns > bestColumns || (columns === bestColumns && rows > bestRows)
          : rows > bestRows || (rows === bestRows && columns > bestColumns));
      if (isBetterArea || isTie) {
        bestArea = area;
        bestColumns = columns;
        bestRows = rows;
      }
    }
  }

  return {
    columns: bestColumns,
    rows: bestRows,
  };
};

export const applyCapacity = (
  draft: GridConfig,
  priority: "columns" | "rows" | "balance" = "balance",
): GridConfig => {
  const geometry = deriveGridGeometry({
    screenInches: draft.screenInches,
    orientation: draft.orientation,
  });
  const maxSlots = geometry.maxSlots;

  let columns = clampInt(draft.columns, GRID_LIMITS.min, GRID_LIMITS.maxColumns);
  let rows = clampInt(draft.rows, GRID_LIMITS.min, GRID_LIMITS.maxRows);

  if (columns * rows <= maxSlots) {
    return { ...draft, columns, rows };
  }

  if (priority === "columns") {
    columns = clampInt(
      Math.min(columns, maxSlots),
      GRID_LIMITS.min,
      GRID_LIMITS.maxColumns,
    );
    const maxRowsAllowed = Math.max(
      GRID_LIMITS.min,
      Math.min(
        GRID_LIMITS.maxRows,
        Math.floor(maxSlots / Math.max(columns, 1)),
      ),
    );
    rows = clampInt(Math.min(rows, maxRowsAllowed), GRID_LIMITS.min, GRID_LIMITS.maxRows);
  } else if (priority === "rows") {
    rows = clampInt(Math.min(rows, maxSlots), GRID_LIMITS.min, GRID_LIMITS.maxRows);
    const maxColumnsAllowed = Math.max(
      GRID_LIMITS.min,
      Math.min(
        GRID_LIMITS.maxColumns,
        Math.floor(maxSlots / Math.max(rows, 1)),
      ),
    );
    columns = clampInt(
      Math.min(columns, maxColumnsAllowed),
      GRID_LIMITS.min,
      GRID_LIMITS.maxColumns,
    );
  } else {
    const adjusted = adjustGridToCapacity(columns, rows, maxSlots);
    columns = adjusted.columns;
    rows = adjusted.rows;
  }

  if (columns * rows > maxSlots) {
    const adjusted = adjustGridToCapacity(columns, rows, maxSlots);
    columns = adjusted.columns;
    rows = adjusted.rows;
  }

  return {
    ...draft,
    columns,
    rows,
  };
};

export type { GridCell, GridConfig, PanelEntry };
export { GRID_LIMITS, makeCellKey };

