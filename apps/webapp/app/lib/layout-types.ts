export type Orientation = "landscape" | "portrait";

export type GridConfig = {
  screenInches: number;
  orientation: Orientation;
  columns: number;
  rows: number;
  gap: number;
  backgroundColor?: string;
  /**
   * Panel connections: array of arrays, where each inner array contains root keys of connected panels.
   * Panels in the same array share a connected background.
   */
  connections?: string[][];
};

export type PanelEntry = {
  id: string;
  componentId: string;
  duration: number;
  appearance?: CellAppearance; // Optional per-entry appearance settings
};

export type CellAppearance = {
  backgroundColor: string;
  borderColor: string;
  borderRadius: number;
  borderWidth: number;
  textColor: string;
  /**
   * Clock-specific options (used when componentId === "clock").
   * They live on the appearance object so they persist with the cell.
   */
  showClockSeconds?: boolean;
  showClockDate?: boolean;
  clockFormat?: "12h" | "24h";
  clockStyle?: "digital" | "analog";
  clockTimezone?: string;
  showMultipleClocks?: boolean; // Show multiple clocks when panel is 1/4 or more
  clockTimezone2?: string; // Second timezone for multiple clocks
  clockTimezone3?: string; // Third timezone for multiple clocks
  clockTimezone4?: string; // Fourth timezone for multiple clocks
  /**
   * Weather-specific options (used when componentId === "weather").
   * Location format: "lat,lon" or "lat,lon,altitude" (e.g., "59.9139,10.7522")
   */
  weatherLocation?: string;
  weatherLocation2?: string; // Second location for dual charts (full screen only)
  showAirQuality?: boolean;
  showLocationForecast?: boolean;
  showTwoCharts?: boolean; // Show 2 charts side by side (full screen only)
  weatherTimeFormat?: "12h" | "24h";
  /**
   * News-specific options (used when componentId === "news").
   */
  newsFeed?: string; // RSS feed key (e.g., "nrk_main", "tv2_nyheter", "dn_main")
  newsScrollSpeed?: number; // Scroll speed in pixels per second (default: 50)
  newsMaxItems?: number; // Maximum number of items to display (default: 10)
  newsShowSource?: boolean; // Show source name for each item
  /**
   * Announcements-specific options (used when componentId === "announcement").
   */
  announcementText?: string; // Simple text announcement with HTML formatting
  /**
   * Branding-specific options (used when componentId === "brand").
   */
  brandingLogoUrl?: string; // URL to logo image
  brandingText?: string; // Branding text/name
  /**
   * Calendar-specific options (used when componentId === "calendar").
   */
  calendarShowUpcoming?: boolean;
  calendarAccentColor?: string;
  calendarMutedColor?: string;
  calendarCellBackground?: string;
  calendarTodayHighlight?: string;
  calendarEventPalette?: string;
  /**
   * Transport-specific options (used when componentId === "transport").
   */
  transportStopPlace?: string; // Stop place name or ID (e.g., "Oslo S", "NSR:StopPlace:582")
  transportStopPlace2?: string; // Second stop place for dual display (medium/large panels only)
  transportShowDualStops?: boolean; // Enable dual stop display (medium/large panels only)
  transportTimeFormat?: "12h" | "24h"; // Time format (default: "24h")
  transportMaxDepartures?: number; // Maximum number of departures to display (default: 10)
  transportBadgeColor?: string; // Badge background color for line number (default: textColor)
  transportBadgeBorder?: string; // Badge border color (default: textColor)
  transportBadgeTextColor?: string; // Badge text color (default: "#000000" black)
  transportBadgeRadius?: number; // Badge border radius (default: matches panel borderRadius)
  transportDelayColor?: string; // Color for delay text (default: "#ef4444" red)
  /**
   * Media-specific options (used when componentId === "media").
   */
  mediaType?: "image" | "video"; // Media type for all items (default: "image")
  mediaUrls?: string; // Comma or space separated URLs
  mediaAutoPlay?: boolean; // Auto-play carousel (default: true)
  mediaTransitionDuration?: number; // Transition duration in seconds (default: 5)
  /**
   * Charts-specific options (used when componentId === "charts").
   */
  chartsConfig?: string; // JSON string of chart configuration (built from input fields)
};

export const makeDefaultAppearance = (): CellAppearance => ({
  backgroundColor: "#2563eb",
  borderColor: "#1d4ed8",
  borderRadius: 20,
  borderWidth: 2,
  textColor: "#ffffff",
  showClockSeconds: true,
  showClockDate: false,
  clockFormat: "24h",
  clockTimezone: "Europe/Oslo",
  weatherLocation: "59.9139,10.7522", // Default to Oslo
  showAirQuality: true,
  showLocationForecast: true,
  weatherTimeFormat: "24h", // Default to 24-hour format
  newsFeed: "nrk_main",
  newsScrollSpeed: 50,
  newsMaxItems: 10,
  newsShowSource: true,
  announcementText: "",
  brandingLogoUrl: "",
  brandingText: "",
  calendarShowUpcoming: true,
  calendarAccentColor: "",
  calendarMutedColor: "",
  calendarCellBackground: "",
  calendarTodayHighlight: "",
  calendarEventPalette: "",
  transportStopPlace: "62356",
  transportTimeFormat: "24h",
  transportMaxDepartures: 10,
  transportBadgeColor: "",
  transportBadgeBorder: "",
  transportBadgeTextColor: "#000000",
  transportDelayColor: "#ef4444",
  mediaType: "image",
  mediaUrls: "",
  mediaAutoPlay: true,
  mediaTransitionDuration: 5,
  chartsConfig: "",
});

export const cloneAppearance = (appearance?: CellAppearance | null) =>
  appearance ? { ...makeDefaultAppearance(), ...appearance } : undefined;

export type GridCell = {
  componentId: string | null;
  colSpan?: number;
  rowSpan?: number;
  coveredBy?: string | null;
  panelEntries?: PanelEntry[];
  appearance?: CellAppearance;
};

export type PersistedLayoutState = {
  config: GridConfig;
  cells: Record<string, GridCell>;
  selectedCells?: string[];
};

export type GridGeometry = {
  widthIn: number;
  heightIn: number;
  widthPx: number;
  heightPx: number;
  aspectRatio: number;
  maxSlots: number;
};

export const LAYOUT_STORAGE_KEY = "sceneblikk-layout-editor";

const DEFAULT_ASPECT = { width: 16, height: 9 };
const DEFAULT_DPI = 96;
const DEFAULT_CELL_SIZE_PX = 220;

export const GRID_LIMITS = {
  min: 1,
  maxColumns: 24,
  maxRows: 24,
  minDiagonal: 13,
  maxDiagonal: 300,
  minGap: 0,
  maxGap: 120,
};

export const DEFAULT_GRID_CONFIG: GridConfig = {
  screenInches: 50,
  orientation: "landscape",
  columns: 6,
  rows: 4,
  gap: 16,
  backgroundColor: "#0a3d62",
  connections: [],
};

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(Math.max(Number.isFinite(value) ? value : min), max);

const clampInteger = (value: number, min: number, max: number) =>
  Math.min(Math.max(Number.isFinite(value) ? Math.round(value) : min), max);

const getAspectForOrientation = (orientation: Orientation) =>
  orientation === "landscape"
    ? DEFAULT_ASPECT
    : { width: DEFAULT_ASPECT.height, height: DEFAULT_ASPECT.width };

const calculatePhysicalDimensions = (
  diagonalIn: number,
  orientation: Orientation,
) => {
  const aspect = getAspectForOrientation(orientation);
  const ratio = Math.sqrt(aspect.width ** 2 + aspect.height ** 2);
  const widthIn = (diagonalIn * aspect.width) / ratio;
  const heightIn = (diagonalIn * aspect.height) / ratio;
  return {
    widthIn,
    heightIn,
  };
};

const calculateMaxSlots = (widthPx: number, heightPx: number) => {
  const moduleArea = DEFAULT_CELL_SIZE_PX ** 2;
  return Math.max(1, Math.floor((widthPx * heightPx) / moduleArea));
};

export const deriveGridGeometry = (input: {
  screenInches: number;
  orientation: Orientation;
}): GridGeometry => {
  const diagonalIn = clampNumber(
    input.screenInches,
    GRID_LIMITS.minDiagonal,
    GRID_LIMITS.maxDiagonal,
  );
  const { widthIn, heightIn } = calculatePhysicalDimensions(
    diagonalIn,
    input.orientation,
  );

  const widthPx = widthIn * DEFAULT_DPI;
  const heightPx = heightIn * DEFAULT_DPI;

  return {
    widthIn,
    heightIn,
    widthPx,
    heightPx,
    aspectRatio: widthIn / heightIn,
    maxSlots: calculateMaxSlots(widthPx, heightPx),
  };
};

type LegacyConfig = Partial<GridConfig> & {
  widthIn?: number;
  heightIn?: number;
  dpi?: number;
  cellPixels?: number;
};

export const adjustGridToCapacity = (
  columns: number,
  rows: number,
  maxSlots: number,
) => {
  let nextColumns = clampInteger(
    Math.min(columns, maxSlots),
    GRID_LIMITS.min,
    GRID_LIMITS.maxColumns,
  );
  let nextRows = clampInteger(
    Math.min(rows, maxSlots),
    GRID_LIMITS.min,
    GRID_LIMITS.maxRows,
  );

  if (nextColumns * nextRows <= maxSlots) {
    return { columns: nextColumns, rows: nextRows };
  }

  const ratio = nextColumns / (nextRows || 1);
  nextColumns = Math.max(
    GRID_LIMITS.min,
    Math.min(
      GRID_LIMITS.maxColumns,
      Math.floor(Math.sqrt(maxSlots * ratio)),
    ),
  );
  nextRows = Math.max(
    GRID_LIMITS.min,
    Math.min(GRID_LIMITS.maxRows, Math.floor(maxSlots / nextColumns)),
  );

  while (nextColumns * nextRows > maxSlots) {
    if (nextColumns >= nextRows && nextColumns > GRID_LIMITS.min) {
      nextColumns -= 1;
    } else if (nextRows > GRID_LIMITS.min) {
      nextRows -= 1;
    } else {
      break;
    }
  }

  return {
    columns: Math.max(nextColumns, GRID_LIMITS.min),
    rows: Math.max(nextRows, GRID_LIMITS.min),
  };
};

export const enforceGridCapacity = (config: GridConfig): GridConfig => {
  const geometry = deriveGridGeometry({
    screenInches: config.screenInches,
    orientation: config.orientation,
  });
  const adjusted = adjustGridToCapacity(
    config.columns,
    config.rows,
    geometry.maxSlots,
  );
  return {
    ...config,
    columns: adjusted.columns,
    rows: adjusted.rows,
  };
};

export const normalizeConfig = (raw?: LegacyConfig | null): GridConfig => {
  if (!raw) {
    return { ...DEFAULT_GRID_CONFIG };
  }

  const guessedDiagonal =
    typeof raw.screenInches === "number"
      ? raw.screenInches
      : typeof raw.widthIn === "number" && typeof raw.heightIn === "number"
        ? Math.sqrt(raw.widthIn ** 2 + raw.heightIn ** 2)
        : typeof raw.widthIn === "number"
          ? raw.widthIn
          : DEFAULT_GRID_CONFIG.screenInches;

  let orientation: Orientation;
  if (raw.orientation === "portrait" || raw.orientation === "landscape") {
    orientation = raw.orientation;
  } else if (
    typeof raw.widthIn === "number" &&
    typeof raw.heightIn === "number"
  ) {
    orientation = raw.heightIn > raw.widthIn ? "portrait" : "landscape";
  } else {
    orientation = DEFAULT_GRID_CONFIG.orientation;
  }

  const screenInches = clampNumber(
    guessedDiagonal,
    GRID_LIMITS.minDiagonal,
    GRID_LIMITS.maxDiagonal,
  );

  const gap = clampNumber(
    typeof raw.gap === "number" ? raw.gap : DEFAULT_GRID_CONFIG.gap,
    GRID_LIMITS.minGap,
    GRID_LIMITS.maxGap,
  );

  let columns =
    typeof raw.columns === "number"
      ? raw.columns
      : typeof raw.widthIn === "number" && typeof raw.dpi === "number"
        ? Math.floor((raw.widthIn * raw.dpi) / (raw.cellPixels ?? DEFAULT_CELL_SIZE_PX))
        : DEFAULT_GRID_CONFIG.columns;

  let rows =
    typeof raw.rows === "number"
      ? raw.rows
      : typeof raw.heightIn === "number" && typeof raw.dpi === "number"
        ? Math.floor((raw.heightIn * raw.dpi) / (raw.cellPixels ?? DEFAULT_CELL_SIZE_PX))
        : DEFAULT_GRID_CONFIG.rows;

  columns = clampInteger(columns, GRID_LIMITS.min, GRID_LIMITS.maxColumns);
  rows = clampInteger(rows, GRID_LIMITS.min, GRID_LIMITS.maxRows);

  const { maxSlots } = deriveGridGeometry({ screenInches, orientation });
  const adjusted = adjustGridToCapacity(columns, rows, maxSlots);

  const backgroundColor =
    typeof raw.backgroundColor === "string" && raw.backgroundColor.trim() !== ""
      ? raw.backgroundColor.trim()
      : DEFAULT_GRID_CONFIG.backgroundColor;

  const connections =
    Array.isArray(raw.connections) && raw.connections.every((g) => Array.isArray(g))
      ? raw.connections
      : DEFAULT_GRID_CONFIG.connections;

  return {
    screenInches,
    orientation,
    columns: adjusted.columns,
    rows: adjusted.rows,
    gap,
    backgroundColor,
    connections,
  };
};

export const makeCellKey = (row: number, column: number) => `${row}-${column}`;

export const createEmptyGrid = (rows: number, columns: number) => {
  const next: Record<string, GridCell> = {};
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      next[makeCellKey(row, column)] = {
        componentId: null,
        colSpan: 1,
        rowSpan: 1,
        coveredBy: null,
        panelEntries: [],
        appearance: makeDefaultAppearance(),
      };
    }
  }
  return next;
};
