"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMonitor, FiRefreshCw, FiRotateCcw } from "react-icons/fi";
import { PLACEHOLDER_MAP } from "../lib/placeholders";
import {
  DEFAULT_GRID_CONFIG,
  GRID_LIMITS,
  type CellAppearance,
  type GridCell,
  type GridConfig,
  LAYOUT_STORAGE_KEY,
  type PersistedLayoutState,
  cloneAppearance,
  createEmptyGrid,
  deriveGridGeometry,
  makeCellKey,
  makeDefaultAppearance,
  normalizeConfig,
} from "../lib/layout-types";
import {
  FREEFORM_COMPONENT_ID,
  applyCapacity,
  assignComponentToRegion,
  clampFloat,
  clampInt,
  clearComponentRegion,
  clonePanelEntries,
  createPanelEntry,
  extractRootComponents,
  findMaxGridWithinCapacity,
  isAreaAvailable,
  parseKey,
  resolveRootKey,
} from "./utils/grid";
import { CanvasPreview } from "./components/CanvasPreview";
import { GridSettingsPanel } from "./components/GridSettingsPanel";
import { PanelPlaybackPanel } from "./components/PanelPlaybackPanel";
import { SelectedComponentPanel } from "./components/SelectedComponentPanel";
import type {
  DrawSelectionBounds,
  DrawState,
  GridGeometry,
  GridItem,
  ResizeHandle,
  ResizeState,
} from "./types";

export default function EditorPage() {
  const router = useRouter();
  const [config, setConfig] = useState<GridConfig>(() => ({
    ...DEFAULT_GRID_CONFIG,
  }));
  const [cells, setCells] = useState<Record<string, GridCell>>(() =>
    createEmptyGrid(DEFAULT_GRID_CONFIG.rows, DEFAULT_GRID_CONFIG.columns),
  );
  const [isHydrated, setHydrated] = useState(false);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [resizeState, setResizeState] = useState<ResizeState>(null);
  const [drawState, setDrawState] = useState<DrawState | null>(null);
  const [screenSizeDraft, setScreenSizeDraft] = useState<string>(
    () => DEFAULT_GRID_CONFIG.screenInches.toString(),
  );
  const hasPanels = useMemo(
    () =>
      Object.values(cells).some(
        (cell) => cell.componentId === FREEFORM_COMPONENT_ID && !cell.coveredBy,
      ),
    [cells],
  );

  const configRef = useRef(config);
  const drawStateRef = useRef<DrawState | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScreenSizeDraft(config.screenInches.toString());
  }, [config.screenInches]);

  useEffect(() => {
    drawStateRef.current = drawState;
  }, [drawState]);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const getAppearancePreset = useCallback((_componentId: string | null | undefined) => {
    return makeDefaultAppearance();
  }, []);

  const [sidebarWidth, setSidebarWidth] = useState(340);
  const [settingsCollapsed, setSettingsCollapsed] = useState(false);
  const [libraryCollapsed, setLibraryCollapsed] = useState(false);

  const primarySelectedCell = selectedCells[0] ?? null;
  const selectionCount = selectedCells.length;

  const getCellKeyFromPointer = useCallback((event: PointerEvent) => {
    const gridEl = gridRef.current;
    const currentConfig = configRef.current;

    if (!gridEl) {
      return null;
    }

    const { columns, rows, gap } = currentConfig;
    if (columns <= 0 || rows <= 0) {
      return null;
    }

    const rect = gridEl.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return null;
    }

    const safeColumns = Math.max(columns, 1);
    const safeRows = Math.max(rows, 1);
    const gridGap = gap ?? 0;

    const trackWidth =
      safeColumns > 0
        ? Math.max((rect.width - gridGap * (safeColumns - 1)) / safeColumns, 0)
        : 0;
    const trackHeight =
      safeRows > 0
        ? Math.max((rect.height - gridGap * (safeRows - 1)) / safeRows, 0)
        : 0;

    const pointerX = clampFloat(event.clientX - rect.left, 0, rect.width - 0.01);
    const pointerY = clampFloat(event.clientY - rect.top, 0, rect.height - 0.01);

    const column =
      trackWidth + gridGap > 0
        ? Math.min(
            safeColumns - 1,
            Math.floor(pointerX / (trackWidth + gridGap)),
          )
        : 0;
    const row =
      trackHeight + gridGap > 0
        ? Math.min(safeRows - 1, Math.floor(pointerY / (trackHeight + gridGap)))
        : 0;

    return makeCellKey(row, column);
  }, []);

  const handleSelectCell = useCallback(
    (key: string, options?: { multi?: boolean }) => {
      const rootKey = resolveRootKey(key, cells);
      setSelectedCells((prev) => {
        if (options?.multi) {
          if (prev.includes(rootKey)) {
            return prev.filter((existing) => existing !== rootKey);
          }
          return [...prev, rootKey];
        }
        return [rootKey];
      });
      setResizeState(null);
    },
    [cells],
  );

  const startSidebarResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }
      event.preventDefault();
      const startX = event.clientX;
      const sidebarElement = sidebarRef.current;
      const initialWidth =
        sidebarElement?.getBoundingClientRect().width ?? sidebarWidth;
      const MIN_WIDTH = 260;
      const MAX_WIDTH = 520;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const delta = moveEvent.clientX - startX;
        const nextWidth = Math.min(
          Math.max(initialWidth + delta, MIN_WIDTH),
          MAX_WIDTH,
        );
        setSidebarWidth(nextWidth);
      };

      const stopResizing = () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", stopResizing);
        window.removeEventListener("pointercancel", stopResizing);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", stopResizing);
      window.addEventListener("pointercancel", stopResizing);
    },
    [sidebarWidth],
  );

  const updateComponentSpan = useCallback(
    (targetKey: string) => {
      if (!resizeState) {
        return;
      }
      let updatedRootKey: string | null = null;
      let didUpdate = false;
      setCells((prev) => {
        const resolvedRootKey = resolveRootKey(resizeState.rootKey, prev);
        const rootCell = prev[resolvedRootKey];
        if (!rootCell?.componentId) {
          return prev;
        }
        const preservedPanelEntries =
          rootCell.componentId === FREEFORM_COMPONENT_ID
            ? clonePanelEntries(rootCell.panelEntries)
            : undefined;
        const preservedAppearance =
          cloneAppearance(rootCell.appearance) ??
          getAppearancePreset(rootCell.componentId ?? null);

        const targetCoords = parseKey(targetKey);
        const gridRows = configRef.current.rows;
        const gridColumns = configRef.current.columns;

        const clampRow = (value: number) => clampInt(value, 0, gridRows - 1);
        const clampColumn = (value: number) => clampInt(value, 0, gridColumns - 1);

        let nextTop = resizeState.initialTop;
        let nextBottom = resizeState.initialBottom;
        let nextLeft = resizeState.initialLeft;
        let nextRight = resizeState.initialRight;

        if (resizeState.handle.includes("n")) {
          nextTop = clampRow(Math.min(targetCoords.row, resizeState.initialBottom));
        }
        if (resizeState.handle.includes("s")) {
          nextBottom = clampRow(Math.max(targetCoords.row, resizeState.initialTop));
        }
        if (resizeState.handle.includes("w")) {
          nextLeft = clampColumn(Math.min(targetCoords.column, resizeState.initialRight));
        }
        if (resizeState.handle.includes("e")) {
          nextRight = clampColumn(Math.max(targetCoords.column, resizeState.initialLeft));
        }

        if (nextTop > nextBottom) {
          [nextTop, nextBottom] = [nextBottom, nextTop];
        }
        if (nextLeft > nextRight) {
          [nextLeft, nextRight] = [nextRight, nextLeft];
        }

        const nextKey = makeCellKey(nextTop, nextLeft);
        const nextColSpan = clampInt(
          nextRight - nextLeft + 1,
          1,
          gridColumns - nextLeft,
        );
        const nextRowSpan = clampInt(
          nextBottom - nextTop + 1,
          1,
          gridRows - nextTop,
        );

        if (
          nextKey === resolvedRootKey &&
          nextColSpan === (rootCell.colSpan ?? 1) &&
          nextRowSpan === (rootCell.rowSpan ?? 1)
        ) {
          return prev;
        }

        const draft = structuredClone(prev);
        clearComponentRegion(resolvedRootKey, draft);

        if (
          !isAreaAvailable(
            draft,
            nextKey,
            nextColSpan,
            nextRowSpan,
            configRef.current,
          )
        ) {
          return prev;
        }

        assignComponentToRegion(
          nextKey,
          draft,
          configRef.current,
          rootCell.componentId,
          nextColSpan,
          nextRowSpan,
          preservedAppearance,
        );
        if (rootCell.componentId === FREEFORM_COMPONENT_ID) {
          draft[nextKey].panelEntries = preservedPanelEntries ?? [];
        }
        updatedRootKey = nextKey;
        didUpdate = true;
        return draft;
      });
      if (didUpdate && updatedRootKey) {
        setSelectedCells([updatedRootKey]);
      }
    },
    [getAppearancePreset, resizeState],
  );

  useEffect(() => {
    if (!resizeState) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const targetKey = getCellKeyFromPointer(event);
      if (!targetKey) {
        return;
      }
      updateComponentSpan(targetKey);
    };

    const handlePointerEnd = () => {
      setResizeState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
    };
  }, [getCellKeyFromPointer, resizeState, updateComponentSpan]);

  useEffect(() => {
    if (!drawState) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const element = document.elementFromPoint(event.clientX, event.clientY);
      if (!element) {
        return;
      }
      const targetEl = element.closest<HTMLElement>("[data-cell-key]");
      const targetKey = targetEl?.dataset.cellKey;
      if (!targetKey) {
        return;
      }
      const { row, column } = parseKey(targetKey);
      setDrawState((prev) => {
        if (!prev) {
          return prev;
        }
        if (prev.currentRow === row && prev.currentColumn === column) {
          return prev;
        }
        return {
          ...prev,
          currentRow: row,
          currentColumn: column,
        };
      });
    };

    const handlePointerEnd = () => {
      const current = drawStateRef.current;
      if (!current) {
        setDrawState(null);
        return;
      }
      const minRow = Math.min(current.anchorRow, current.currentRow);
      const maxRow = Math.max(current.anchorRow, current.currentRow);
      const minColumn = Math.min(current.anchorColumn, current.currentColumn);
      const maxColumn = Math.max(current.anchorColumn, current.currentColumn);
      const rootKey = makeCellKey(minRow, minColumn);
      const colSpan = maxColumn - minColumn + 1;
      const rowSpan = maxRow - minRow + 1;

      let createdRoot: string | null = null;
      setCells((prev) => {
        if (
          !isAreaAvailable(prev, rootKey, colSpan, rowSpan, configRef.current)
        ) {
          return prev;
        }
        const next = structuredClone(prev);
        assignComponentToRegion(
          rootKey,
          next,
          configRef.current,
          FREEFORM_COMPONENT_ID,
          colSpan,
          rowSpan,
          getAppearancePreset(FREEFORM_COMPONENT_ID),
        );
        createdRoot = rootKey;
        return next;
      });

      if (createdRoot) {
        setSelectedCells([createdRoot]);
      }
      setDrawState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
    };
  }, [drawState]);

  useEffect(() => {
    if (!resizeState) {
      return;
    }
    const previousCursor = document.body.style.cursor;
    const cursorByHandle: Record<ResizeHandle, string> = {
      se: "nwse-resize",
      nw: "nwse-resize",
      ne: "nesw-resize",
      sw: "nesw-resize",
    };
    document.body.style.cursor = cursorByHandle[resizeState.handle] ?? "nwse-resize";
    return () => {
      document.body.style.cursor = previousCursor;
    };
  }, [resizeState]);

  useEffect(() => {
    setResizeState(null);
    setDrawState(null);
  }, [config.columns, config.rows, config.orientation]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (!raw) {
        setHydrated(true);
        return;
      }
      const parsed = JSON.parse(raw) as Partial<PersistedLayoutState>;
      const normalized = applyCapacity(normalizeConfig(parsed?.config), "balance");
      const next = createEmptyGrid(normalized.rows, normalized.columns);
      const storedCells = parsed?.cells ?? {};
      const roots = extractRootComponents(storedCells);
      for (const root of roots) {
        if (
          !isAreaAvailable(next, root.key, root.colSpan, root.rowSpan, normalized)
        ) {
          continue;
        }
        assignComponentToRegion(
          root.key,
          next,
          normalized,
          root.componentId,
          root.colSpan,
          root.rowSpan,
          root.appearance ?? getAppearancePreset(root.componentId),
        );
        if (root.componentId === FREEFORM_COMPONENT_ID) {
          next[root.key].panelEntries = clonePanelEntries(root.panelEntries);
        }
      }

      setConfig(normalized);
      setCells(next);
    } catch (error) {
      console.warn("Unable to restore editor state", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") {
      return;
    }
    const payload: PersistedLayoutState = { config, cells };
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(payload));
  }, [cells, config, isHydrated]);

  const geometry = useMemo<GridGeometry>(
    () =>
      deriveGridGeometry({
        screenInches: config.screenInches,
        orientation: config.orientation,
      }),
    [config.orientation, config.screenInches],
  );

  const drawBounds = useMemo<DrawSelectionBounds | null>(() => {
    if (!drawState) {
      return null;
    }
    const minRow = Math.min(drawState.anchorRow, drawState.currentRow);
    const maxRow = Math.max(drawState.anchorRow, drawState.currentRow);
    const minColumn = Math.min(drawState.anchorColumn, drawState.currentColumn);
    const maxColumn = Math.max(drawState.anchorColumn, drawState.currentColumn);
    const rootKey = makeCellKey(minRow, minColumn);
    const colSpan = maxColumn - minColumn + 1;
    const rowSpan = maxRow - minRow + 1;
    const isValid = isAreaAvailable(cells, rootKey, colSpan, rowSpan, config);
    return {
      minRow,
      maxRow,
      minColumn,
      maxColumn,
      rootKey,
      colSpan,
      rowSpan,
      isValid,
    };
  }, [drawState, cells, config]);

  useEffect(() => {
    setCells((prev) => {
      const next = createEmptyGrid(config.rows, config.columns);
      const roots = extractRootComponents(prev);

      for (const root of roots) {
        const { row, column } = parseKey(root.key);
        if (row >= config.rows || column >= config.columns) {
          continue;
        }
        const colSpan = Math.min(root.colSpan, config.columns - column);
        const rowSpan = Math.min(root.rowSpan, config.rows - row);
        if (
          colSpan > 0 &&
          rowSpan > 0 &&
          isAreaAvailable(next, root.key, colSpan, rowSpan, config)
        ) {
          assignComponentToRegion(
            root.key,
            next,
            config,
            root.componentId,
            colSpan,
            rowSpan,
            root.appearance ?? getAppearancePreset(root.componentId),
          );
          if (root.componentId === FREEFORM_COMPONENT_ID) {
            next[root.key].panelEntries = clonePanelEntries(root.panelEntries);
          }
        }
      }

      return next;
    });
  }, [config]);

  useEffect(() => {
    setSelectedCells((prev) =>
      prev.filter((key) => {
        const { row, column } = parseKey(key);
        return row < config.rows && column < config.columns;
      }),
    );
  }, [config.rows, config.columns]);

  const canvasTitle = useMemo(() => {
    const roundedRatio = geometry.aspectRatio.toFixed(2);
    return `${geometry.widthIn.toFixed(1)} in × ${geometry.heightIn.toFixed(
      1,
    )} in • ${roundedRatio}:1 ratio • ${config.columns} × ${
      config.rows
    } grid`;
  }, [config.columns, config.rows, geometry]);

  const handleScreenSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    setScreenSizeDraft(rawValue);
    if (rawValue.trim() === "") {
      return;
    }
    const numericValue = Number(rawValue);
    if (Number.isNaN(numericValue)) {
      return;
    }
    setConfig((prev) => {
      const normalizedScreen = Math.min(
        Math.max(numericValue, GRID_LIMITS.minDiagonal),
        GRID_LIMITS.maxDiagonal,
      );
      if (hasPanels) {
        return {
          ...prev,
          screenInches: normalizedScreen,
        };
      }
      const geometry = deriveGridGeometry({
        screenInches: normalizedScreen,
        orientation: prev.orientation,
      });
      const maxGrid = findMaxGridWithinCapacity(geometry.maxSlots, prev.orientation);
      return {
        ...prev,
        screenInches: normalizedScreen,
        columns: maxGrid.columns,
        rows: maxGrid.rows,
      };
    });
  };

  const handleScreenSizeBlur = () => {
    if (screenSizeDraft.trim() === "") {
      setScreenSizeDraft(config.screenInches.toString());
      return;
    }
    const numericValue = Number(screenSizeDraft);
    if (Number.isNaN(numericValue)) {
      setScreenSizeDraft(config.screenInches.toString());
      return;
    }
    const normalizedScreen = Math.min(
      Math.max(numericValue, GRID_LIMITS.minDiagonal),
      GRID_LIMITS.maxDiagonal,
    );
    setScreenSizeDraft(normalizedScreen.toString());
    setConfig((prev) => {
      if (hasPanels) {
        return {
          ...prev,
          screenInches: normalizedScreen,
        };
      }
      const geometry = deriveGridGeometry({
        screenInches: normalizedScreen,
        orientation: prev.orientation,
      });
      const maxGrid = findMaxGridWithinCapacity(geometry.maxSlots, prev.orientation);
      return {
        ...prev,
        screenInches: normalizedScreen,
        columns: maxGrid.columns,
        rows: maxGrid.rows,
      };
    });
  };

  const handleGapChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) {
      return;
    }
    setConfig((prev) => ({
      ...prev,
      gap: Math.min(
        Math.max(Math.round(value), GRID_LIMITS.minGap),
        GRID_LIMITS.maxGap,
      ),
    }));
  };

  const handleBackgroundColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    setConfig((prev) => ({
      ...prev,
      backgroundColor: value || DEFAULT_GRID_CONFIG.backgroundColor,
    }));
  };

  const handleDimensionChange =
    (key: "columns" | "rows") => (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value);
      if (Number.isNaN(value)) {
        return;
      }
      setConfig((prev) =>
        applyCapacity(
          {
            ...prev,
            [key]: value,
          },
          key === "columns" ? "columns" : "rows",
        ),
      );
    };

  const toggleOrientation = () => {
    setConfig((prev) =>
      applyCapacity(
        {
          ...prev,
          orientation:
            prev.orientation === "landscape" ? "portrait" : "landscape",
        },
        "balance",
      ),
    );
  };

  const startResize =
    (key: string, handle: ResizeHandle) =>
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      event.preventDefault();
      const rootKey = resolveRootKey(key, cells);
      const cell = cells[rootKey];
      if (!cell?.componentId) {
        return;
      }
      const { row, column } = parseKey(rootKey);
      const originalColSpan = cell.colSpan ?? 1;
      const originalRowSpan = cell.rowSpan ?? 1;
      setSelectedCells([rootKey]);
      setResizeState({
        rootKey,
        originalColSpan,
        originalRowSpan,
        handle,
        initialTop: row,
        initialLeft: column,
        initialBottom: row + originalRowSpan - 1,
        initialRight: column + originalColSpan - 1,
      });
    };

  const handleDragStartPalette =
    (componentId: string) => (event: DragEvent<HTMLDivElement>) => {
      event.dataTransfer.setData("componentId", componentId);
      event.dataTransfer.effectAllowed = "copyMove";
    };

  const startDraw =
    (key: string) => (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }
      if (event.shiftKey) {
        return;
      }
      if (resizeState || drawState) {
        return;
      }
      const rootKey = resolveRootKey(key, cells);
      const cell = cells[rootKey];
      if (cell?.componentId) {
        return;
      }
      event.preventDefault();
      setSelectedCells([rootKey]);
      const { row, column } = parseKey(rootKey);
      setDrawState({
        anchorRow: row,
        anchorColumn: column,
        currentRow: row,
        currentColumn: column,
      });
    };

  const handleDragStartCell =
    (cellKey: string) => (event: DragEvent<HTMLDivElement>) => {
      const rootKey = resolveRootKey(cellKey, cells);
      const componentId = cells[rootKey]?.componentId;
      if (!componentId) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.setData("componentId", componentId);
      event.dataTransfer.setData("fromCell", rootKey);
      event.dataTransfer.effectAllowed = "move";
    };

  const handleDropOnCell =
    (cellKey: string) => (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const componentId = event.dataTransfer.getData("componentId");
      if (!componentId) {
        return;
      }
      const fromCell = event.dataTransfer.getData("fromCell");
      const targetSelection = resolveRootKey(cellKey, cells);

      setCells((prev) => {
        const next = structuredClone(prev);
        const targetRoot = resolveRootKey(cellKey, next);
        const targetCell = next[targetRoot];
        const sourceRoot = fromCell ? resolveRootKey(fromCell, next) : null;
        const currentConfig = configRef.current;

        if (sourceRoot && targetRoot === sourceRoot) {
          return prev;
        }

        const moving =
          sourceRoot && next[sourceRoot]?.componentId
            ? {
                rootKey: sourceRoot,
                componentId: next[sourceRoot].componentId as string,
                colSpan: next[sourceRoot].colSpan ?? 1,
                rowSpan: next[sourceRoot].rowSpan ?? 1,
                panelEntries: clonePanelEntries(next[sourceRoot].panelEntries),
                appearance:
                  cloneAppearance(next[sourceRoot].appearance) ??
                  getAppearancePreset(next[sourceRoot].componentId),
              }
            : null;

        const targetIsPanel = targetCell?.componentId === FREEFORM_COMPONENT_ID;

        if (targetIsPanel) {
          const placementComponentId = moving?.componentId ?? componentId;
          if (moving) {
            clearComponentRegion(moving.rootKey, next);
          }
          const panelCell = next[targetRoot];
          panelCell.panelEntries = panelCell.panelEntries ?? [];
          panelCell.panelEntries = [
            ...panelCell.panelEntries,
            createPanelEntry(placementComponentId),
          ];
          return next;
        }

        if (!moving) {
          return prev;
        }

        const placementComponentId = moving.componentId;
        const desiredColSpan = moving.colSpan ?? 1;
        const desiredRowSpan = moving.rowSpan ?? 1;

        clearComponentRegion(moving.rootKey, next);
        clearComponentRegion(targetRoot, next);

        if (
          !isAreaAvailable(
            next,
            targetRoot,
            desiredColSpan,
            desiredRowSpan,
            currentConfig,
          )
        ) {
          if (moving) {
            assignComponentToRegion(
              moving.rootKey,
              next,
              currentConfig,
              moving.componentId,
              moving.colSpan ?? 1,
              moving.rowSpan ?? 1,
              moving.appearance,
            );
          }
          return prev;
        }

        const placementAppearance =
          moving?.appearance ?? getAppearancePreset(placementComponentId);

        assignComponentToRegion(
          targetRoot,
          next,
          currentConfig,
          placementComponentId,
          desiredColSpan,
          desiredRowSpan,
          placementAppearance,
        );
        if (placementComponentId === FREEFORM_COMPONENT_ID) {
          next[targetRoot].panelEntries = clonePanelEntries(moving.panelEntries);
        }

        return next;
      });

      setSelectedCells([targetSelection]);
      setResizeState(null);
    };

  const handlePanelEntryDurationChange =
    (entryId: string) => (event: ChangeEvent<HTMLInputElement>) => {
      if (selectionCount !== 1 || !primarySelectedCell) {
        return;
      }
      const rawValue = Number(event.target.value);
      if (Number.isNaN(rawValue)) {
        return;
      }
      const duration = clampInt(rawValue, 1, 86400);
      setCells((prev) => {
        const rootKey = resolveRootKey(primarySelectedCell, prev);
        const cell = prev[rootKey];
        if (cell?.componentId !== FREEFORM_COMPONENT_ID) {
          return prev;
        }
        const hasEntry = (cell.panelEntries ?? []).some(
          (entry) => entry.id === entryId,
        );
        if (!hasEntry) {
          return prev;
        }
        const next = structuredClone(prev);
        const nextCell = next[rootKey];
        if (nextCell?.componentId !== FREEFORM_COMPONENT_ID) {
          return prev;
        }
        nextCell.panelEntries = clonePanelEntries(nextCell.panelEntries);
        const targetEntry = nextCell.panelEntries?.find((entry) => entry.id === entryId);
        if (!targetEntry) {
          return prev;
        }
        targetEntry.duration = duration;
        return next;
      });
    };

  const handleRemovePanelEntry = (entryId: string) => {
    if (selectionCount !== 1 || !primarySelectedCell) {
      return;
    }
    setCells((prev) => {
      const rootKey = resolveRootKey(primarySelectedCell, prev);
      const cell = prev[rootKey];
      if (cell?.componentId !== FREEFORM_COMPONENT_ID) {
        return prev;
      }
      const entries = cell.panelEntries ?? [];
      if (!entries.some((entry) => entry.id === entryId)) {
        return prev;
      }
      const next = structuredClone(prev);
      const nextCell = next[rootKey];
      if (nextCell?.componentId !== FREEFORM_COMPONENT_ID) {
        return prev;
      }
      nextCell.panelEntries = (nextCell.panelEntries ?? []).filter(
        (entry) => entry.id !== entryId,
      );
      return next;
    });
  };

  const clearCells = useCallback(
    (cellKeys: string[]) => {
      if (cellKeys.length === 0) {
        return;
      }
      const uniqueKeys = Array.from(new Set(cellKeys));
      setCells((prev) => {
        const next = structuredClone(prev);
        for (const key of uniqueKeys) {
          const rootKey = resolveRootKey(key, next);
          clearComponentRegion(rootKey, next);
        }
        return next;
      });
      setSelectedCells((prev) =>
        prev.filter((key) => !uniqueKeys.includes(key)),
      );
      setResizeState(null);
    },
    [],
  );

  const clearCell = (cellKey: string) => {
    clearCells([cellKey]);
  };

  const handleCanvasClick = () => {
    if (!resizeState) {
      setSelectedCells([]);
    }
  };

  const resetLayout = () => {
    setConfig({ ...DEFAULT_GRID_CONFIG });
    setCells(
      createEmptyGrid(DEFAULT_GRID_CONFIG.rows, DEFAULT_GRID_CONFIG.columns),
    );
    setSelectedCells([]);
    setResizeState(null);
  };

  const takeToPlayer = () => {
    router.push("/view");
  };

  const gridItems = useMemo<GridItem[]>(() => {
    const items: GridItem[] = [];
    for (let row = 0; row < config.rows; row += 1) {
      for (let column = 0; column < config.columns; column += 1) {
        const key = makeCellKey(row, column);
        const cell = cells[key];
        if (cell?.coveredBy) {
          continue;
        }
        items.push({ key, cell: cell ?? { componentId: null } });
      }
    }
    return items;
  }, [cells, config.columns, config.rows]);

  const totalCells = config.columns * config.rows;
  const occupiedSlots = gridItems.reduce(
    (acc, { cell }) => acc + (cell.colSpan ?? 1) * (cell.rowSpan ?? 1),
    0,
  );
  const freeSlots = Math.max(totalCells - occupiedSlots, 0);
  const geometryBuffer = Math.max(geometry.maxSlots - totalCells, 0);

  const handleSpanChange =
    (dimension: "colSpan" | "rowSpan") => (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value);
      if (selectionCount !== 1 || !primarySelectedCell || Number.isNaN(value)) {
        return;
      }
      setCells((prev) => {
        const rootKey = resolveRootKey(primarySelectedCell, prev);
        const cell = prev[rootKey];
        if (!cell?.componentId) {
          return prev;
        }
        const preservedPanelEntries =
          cell.componentId === FREEFORM_COMPONENT_ID
            ? clonePanelEntries(cell.panelEntries)
            : undefined;
        const preservedAppearance =
          cloneAppearance(cell.appearance) ?? getAppearancePreset(cell.componentId);
        const { row, column } = parseKey(rootKey);
        const maxColSpan = config.columns - column;
        const maxRowSpan = config.rows - row;
        const desiredColSpan =
          dimension === "colSpan"
            ? clampInt(value, 1, maxColSpan)
            : clampInt(cell.colSpan ?? 1, 1, maxColSpan);
        const desiredRowSpan =
          dimension === "rowSpan"
            ? clampInt(value, 1, maxRowSpan)
            : clampInt(cell.rowSpan ?? 1, 1, maxRowSpan);

        const next = structuredClone(prev);
        clearComponentRegion(rootKey, next);
        if (
          !isAreaAvailable(
            next,
            rootKey,
            desiredColSpan,
            desiredRowSpan,
            config,
          )
        ) {
          assignComponentToRegion(
            rootKey,
            next,
            config,
            cell.componentId,
            cell.colSpan ?? 1,
            cell.rowSpan ?? 1,
            preservedAppearance,
          );
          return prev;
        }
        assignComponentToRegion(
          rootKey,
          next,
          config,
          cell.componentId,
          desiredColSpan,
          desiredRowSpan,
          preservedAppearance,
        );
        if (cell.componentId === FREEFORM_COMPONENT_ID) {
          next[rootKey].panelEntries = preservedPanelEntries ?? [];
        }
        return next;
      });
    };

  const selectedCellData = primarySelectedCell ? cells[primarySelectedCell] : null;
  const selectedComponentId = selectedCellData?.componentId ?? null;
  const isFreeformSelected =
    selectionCount === 1 && selectedComponentId === FREEFORM_COMPONENT_ID;
  const selectedPanelEntries =
    isFreeformSelected && selectedCellData?.panelEntries
      ? selectedCellData.panelEntries
      : [];
  const selectedPanelEntriesCount = selectedPanelEntries.length;
  const totalPanelDuration = selectedPanelEntries.reduce(
    (acc, entry) => acc + entry.duration,
    0,
  );
  let selectedComponentLabel: string | undefined;
  if (selectedComponentId != null) {
    const placeholderLabel = PLACEHOLDER_MAP[selectedComponentId]?.label;
    if (placeholderLabel) {
      selectedComponentLabel = placeholderLabel;
    } else if (isFreeformSelected) {
      selectedComponentLabel =
        selectedPanelEntriesCount > 0
          ? `Panel • ${selectedPanelEntriesCount} ${
              selectedPanelEntriesCount === 1 ? "item" : "items"
            }`
          : "Panel";
    }
  }

  const handleAppearanceChange = useCallback(
    (changes: Partial<CellAppearance>) => {
      if (selectedCells.length === 0) {
        return;
      }
      const targetKeys = Array.from(new Set(selectedCells));
      setCells((prev) => {
        const next = structuredClone(prev);
        let didUpdate = false;
        for (const key of targetKeys) {
          const rootKey = resolveRootKey(key, next);
          const cell = next[rootKey];
          if (!cell?.componentId) {
            continue;
          }
          const baseAppearance =
            cloneAppearance(cell.appearance) ?? getAppearancePreset(cell.componentId);
          const updatedAppearance: CellAppearance = {
            ...baseAppearance,
            ...changes,
          };
          cell.appearance = updatedAppearance;
          didUpdate = true;
        }
        return didUpdate ? next : prev;
      });
    },
    [getAppearancePreset, selectedCells],
  );

  const selectedAppearance =
    selectedComponentId != null
      ? selectedCellData?.appearance ?? getAppearancePreset(selectedComponentId)
      : null;

  return (
    <div className="min-h-screen bg-custom-color-100 text-black transition-colors duration-300 dark:bg-custom-color-900 dark:text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-20 pt-16 sm:px-10 lg:px-16">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-custom-color-600 dark:text-custom-color-200">
              Editor
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Layout designer
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-custom-color-700/80 dark:text-custom-color-100/75">
              Configure the canvas, assemble components, and fine-tune module spans
              before launching to the full-screen player.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={resetLayout}
              className="inline-flex items-center gap-2 rounded-full border border-custom-color-400 bg-transparent px-4 py-2 text-sm font-semibold text-custom-color-600 transition hover:bg-custom-color-200/40 dark:border-custom-color-300/40 dark:text-custom-color-100 dark:hover:bg-custom-color-700/50"
            >
              <FiRefreshCw className="h-4 w-4" />
              Reset layout
            </button>
            <button
              type="button"
              onClick={toggleOrientation}
              className="inline-flex items-center gap-2 rounded-full border border-custom-color-400 bg-transparent px-4 py-2 text-sm font-semibold text-custom-color-600 transition hover:bg-custom-color-200/40 dark:border-custom-color-300/40 dark:text-custom-color-100 dark:hover:bg-custom-color-700/50"
            >
              <FiRotateCcw className="h-4 w-4" />
              {config.orientation === "landscape"
                ? "Rotate to portrait"
                : "Rotate to landscape"}
            </button>
            <button
              type="button"
              onClick={takeToPlayer}
              className="inline-flex items-center gap-2 rounded-full bg-custom-color-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-custom-color-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-custom-color-300 dark:bg-custom-color-400 dark:hover:bg-custom-color-300"
            >
              <FiMonitor className="h-4 w-4" />
              View full screen
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-6">
          <div
            ref={sidebarRef}
            className="w-full lg:h-[calc(100vh-10vh)] lg:flex-shrink-0"
            style={{ width: sidebarWidth }}
          >
            <GridSettingsPanel
              config={config}
              screenSizeDraft={screenSizeDraft}
              onScreenSizeChange={handleScreenSizeChange}
              onScreenSizeBlur={handleScreenSizeBlur}
              onDimensionChange={handleDimensionChange}
              onGapChange={handleGapChange}
              onBackgroundColorChange={handleBackgroundColorChange}
              totalCells={totalCells}
              occupiedSlots={occupiedSlots}
              freeSlots={freeSlots}
              geometryBuffer={geometryBuffer}
              geometry={geometry}
              onDragStartPalette={handleDragStartPalette}
              isSettingsCollapsed={settingsCollapsed}
              isLibraryCollapsed={libraryCollapsed}
              onToggleSettings={() => setSettingsCollapsed((prev) => !prev)}
              onToggleLibrary={() => setLibraryCollapsed((prev) => !prev)}
            />
          </div>
          <div
            className="hidden w-1.5 cursor-col-resize rounded-full bg-gradient-to-b from-custom-color-200/0 via-custom-color-200/70 to-custom-color-200/0 lg:block dark:via-white/50"
            onPointerDown={startSidebarResize}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize settings panel"
          />
          <section className="flex flex-1 flex-col gap-6">
            <CanvasPreview
              canvasTitle={canvasTitle}
              geometry={geometry}
              config={config}
              gridItems={gridItems}
              drawBounds={drawBounds}
              selectedCells={selectedCells}
              selectionCount={selectionCount}
              gridRef={gridRef}
              onCanvasClick={handleCanvasClick}
              onSelectCell={handleSelectCell}
              onStartDraw={startDraw}
              onDragStartCell={handleDragStartCell}
              onDropOnCell={handleDropOnCell}
              onClearCell={clearCell}
              onStartResize={startResize}
            />
            {isFreeformSelected ? (
              <PanelPlaybackPanel
                entries={selectedPanelEntries}
                totalDuration={totalPanelDuration}
                onDurationChange={handlePanelEntryDurationChange}
                onRemoveEntry={handleRemovePanelEntry}
              />
            ) : null}
            <SelectedComponentPanel
              selectionCount={selectionCount}
              primarySelectedCell={primarySelectedCell}
              selectedCellData={selectedCellData ?? null}
              config={config}
              selectedComponentLabel={selectedComponentLabel}
              onSpanChange={handleSpanChange}
              onClearSelection={() => clearCells(selectedCells)}
              isFreeformSelected={isFreeformSelected}
              selectedAppearance={selectedAppearance}
              onAppearanceChange={handleAppearanceChange}
            />
            <div className="glass-surface rounded-3xl border border-white/30 p-6 shadow-lg dark:border-white/10">
              <h2 className="text-lg font-semibold text-custom-color-800 dark:text-custom-color-100">
                Need to monitor content?
              </h2>
              <p className="mt-2 text-sm text-custom-color-700/80 dark:text-custom-color-100/70">
                Jump into the dashboard to track playback status, spot stale
                layouts, and coordinate with your signage team.
              </p>
              <Link
                href="/dashboard"
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-custom-color-400 px-4 py-2 text-sm font-semibold text-custom-color-600 transition hover:bg-custom-color-200/50 dark:border-custom-color-300/40 dark:text-custom-color-50 dark:hover:bg-custom-color-700/40"
              >
                Open dashboard
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}