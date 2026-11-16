import {
  GRID_LIMITS,
  type CellAppearance,
  type GridCell,
  type GridConfig,
  type PanelEntry,
  adjustGridToCapacity,
  cloneAppearance,
  deriveGridGeometry,
  makeCellKey,
  makeDefaultAppearance,
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
  entries
    ? entries.map((entry) => ({
        ...entry,
        // Only include `appearance` when it actually exists; avoid
        // explicitly setting it to `undefined`, which breaks Firestore
        // when layouts are persisted.
        ...(entry.appearance
          ? { appearance: cloneAppearance(entry.appearance) }
          : {}),
      }))
    : [];

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
        cell.appearance = makeDefaultAppearance();
      } else if (cell.coveredBy === key) {
        draft[currentKey] = {
          componentId: null,
          colSpan: 1,
          rowSpan: 1,
          coveredBy: null,
          panelEntries: [],
          appearance: makeDefaultAppearance(),
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
  appearance?: CellAppearance,
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
    appearance: makeDefaultAppearance(),
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
  const nextAppearance = appearance
    ? { ...appearance }
    : root.appearance
      ? { ...root.appearance }
      : makeDefaultAppearance();
  root.appearance = nextAppearance;
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
          appearance: makeDefaultAppearance(),
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
        draft[currentKey].appearance = { ...nextAppearance };
      } else {
        draft[currentKey].componentId = null;
        draft[currentKey].colSpan = 1;
        draft[currentKey].rowSpan = 1;
        draft[currentKey].coveredBy = key;
        draft[currentKey].panelEntries = [];
        draft[currentKey].appearance = makeDefaultAppearance();
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
      appearance: cloneAppearance(cell.appearance),
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

/**
 * Find all neighboring panels (panels that share an edge) with a given panel.
 * Returns an array of root keys of neighboring panels.
 */
export const findNeighboringPanels = (
  rootKey: string,
  grid: Record<string, GridCell>,
  config: GridConfig,
): string[] => {
  const rootCell = grid[rootKey];
  if (!rootCell || rootCell.componentId !== FREEFORM_COMPONENT_ID) {
    return [];
  }

  const { row, column } = parseKey(rootKey);
  const colSpan = rootCell.colSpan ?? 1;
  const rowSpan = rootCell.rowSpan ?? 1;
  const neighbors: Set<string> = new Set();

  // Check cells to the north (top edge)
  if (row > 0) {
    for (let c = column; c < column + colSpan; c += 1) {
      const neighborKey = makeCellKey(row - 1, c);
      const neighborCell = grid[neighborKey];
      if (neighborCell?.componentId === FREEFORM_COMPONENT_ID && !neighborCell.coveredBy) {
        neighbors.add(neighborKey);
      } else if (neighborCell?.coveredBy) {
        const coveredRoot = resolveRootKey(neighborKey, grid);
        const coveredCell = grid[coveredRoot];
        if (coveredCell?.componentId === FREEFORM_COMPONENT_ID) {
          neighbors.add(coveredRoot);
        }
      }
    }
  }

  // Check cells to the south (bottom edge)
  if (row + rowSpan < config.rows) {
    for (let c = column; c < column + colSpan; c += 1) {
      const neighborKey = makeCellKey(row + rowSpan, c);
      const neighborCell = grid[neighborKey];
      if (neighborCell?.componentId === FREEFORM_COMPONENT_ID && !neighborCell.coveredBy) {
        neighbors.add(neighborKey);
      } else if (neighborCell?.coveredBy) {
        const coveredRoot = resolveRootKey(neighborKey, grid);
        const coveredCell = grid[coveredRoot];
        if (coveredCell?.componentId === FREEFORM_COMPONENT_ID) {
          neighbors.add(coveredRoot);
        }
      }
    }
  }

  // Check cells to the west (left edge)
  if (column > 0) {
    for (let r = row; r < row + rowSpan; r += 1) {
      const neighborKey = makeCellKey(r, column - 1);
      const neighborCell = grid[neighborKey];
      if (neighborCell?.componentId === FREEFORM_COMPONENT_ID && !neighborCell.coveredBy) {
        neighbors.add(neighborKey);
      } else if (neighborCell?.coveredBy) {
        const coveredRoot = resolveRootKey(neighborKey, grid);
        const coveredCell = grid[coveredRoot];
        if (coveredCell?.componentId === FREEFORM_COMPONENT_ID) {
          neighbors.add(coveredRoot);
        }
      }
    }
  }

  // Check cells to the east (right edge)
  if (column + colSpan < config.columns) {
    for (let r = row; r < row + rowSpan; r += 1) {
      const neighborKey = makeCellKey(r, column + colSpan);
      const neighborCell = grid[neighborKey];
      if (neighborCell?.componentId === FREEFORM_COMPONENT_ID && !neighborCell.coveredBy) {
        neighbors.add(neighborKey);
      } else if (neighborCell?.coveredBy) {
        const coveredRoot = resolveRootKey(neighborKey, grid);
        const coveredCell = grid[coveredRoot];
        if (coveredCell?.componentId === FREEFORM_COMPONENT_ID) {
          neighbors.add(coveredRoot);
        }
      }
    }
  }

  return Array.from(neighbors);
};

/**
 * Get the connection group that a panel belongs to, or null if not connected.
 */
export const getConnectionGroup = (
  rootKey: string,
  connections: string[][] | undefined,
): string[] | null => {
  if (!connections || connections.length === 0) {
    return null;
  }
  
  for (const group of connections) {
    if (group.includes(rootKey)) {
      return group;
    }
  }
  
  return null;
};

/**
 * Add a connection between two panels, merging groups if necessary.
 */
export const addConnection = (
  key1: string,
  key2: string,
  existingConnections: string[][] | undefined,
): string[][] => {
  const connections = existingConnections ? [...existingConnections] : [];
  
  // Find groups containing key1 and key2
  let group1Index = -1;
  let group2Index = -1;
  
  for (let i = 0; i < connections.length; i++) {
    if (connections[i].includes(key1)) {
      group1Index = i;
    }
    if (connections[i].includes(key2)) {
      group2Index = i;
    }
  }
  
  if (group1Index === -1 && group2Index === -1) {
    // Neither key is in a group, create a new group
    connections.push([key1, key2]);
  } else if (group1Index === -1) {
    // key1 is not in a group, add it to key2's group
    connections[group2Index].push(key1);
  } else if (group2Index === -1) {
    // key2 is not in a group, add it to key1's group
    connections[group1Index].push(key2);
  } else if (group1Index !== group2Index) {
    // Both keys are in different groups, merge them
    const merged = [...connections[group1Index], ...connections[group2Index]];
    // Remove duplicates
    const unique = Array.from(new Set(merged));
    // Remove the two old groups and add the merged one
    connections.splice(Math.max(group1Index, group2Index), 1);
    connections.splice(Math.min(group1Index, group2Index), 1);
    connections.push(unique);
  }
  // If both keys are already in the same group, do nothing
  
  return connections;
};

/**
 * Remove a panel from all connections, splitting groups if necessary.
 */
export const removeConnection = (
  key: string,
  existingConnections: string[][] | undefined,
): string[][] => {
  if (!existingConnections || existingConnections.length === 0) {
    return [];
  }
  
  const connections = [...existingConnections];
  
  // Find the group containing the key
  for (let i = 0; i < connections.length; i++) {
    const group = connections[i];
    if (group.includes(key)) {
      // Remove the key from the group
      const newGroup = group.filter(k => k !== key);
      
      if (newGroup.length === 0) {
        // Group is empty, remove it
        connections.splice(i, 1);
      } else if (newGroup.length === 1) {
        // Only one panel left, remove the group (single panels aren't connected)
        connections.splice(i, 1);
      } else {
        // Update the group
        connections[i] = newGroup;
      }
      break;
    }
  }
  
  return connections;
};

export type { GridCell, GridConfig, PanelEntry };
export { GRID_LIMITS, makeCellKey };

