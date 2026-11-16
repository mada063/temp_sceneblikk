# Building a New View Component

This guide describes how to add a new component to the Sceneblikk **view player** — the fullscreen grid that displays live content on screens.

The view is a CSS grid where each cell stores a `componentId` and an `appearance` config. The player renders real components via `ComponentRenderer`; the editor shows placeholder icons only.

---

## Architecture at a Glance

```
Layout config (Firestore / localStorage)
  └── GridCell { componentId, colSpan, rowSpan, appearance }
        └── view/page.tsx
              └── ComponentRenderer  →  YourComponent (index.tsx)
                    └── MyWidgetTiny / Small / Medium / Large / XLarge
```

**Key files:**

| File | Purpose |
|------|---------|
| `app/view/page.tsx` | Loads layout, renders grid cells |
| `app/view/components/ComponentRenderer.tsx` | Dispatches `componentId` → component via registry |
| `app/lib/component-registry.ts` | **Single source of truth** for component metadata |
| `app/view/components/view-registry.tsx` | Maps `componentId` → live view component |
| `app/lib/placeholders.ts` | Re-exports registry (backward compat for editor) |
| `app/lib/appearance/` | Per-component appearance types + defaults |
| `app/lib/layout-types.ts` | Re-exports `CellAppearance` / grid types |
| `app/view/hooks/usePanelSize.ts` | Shared panel size (`tiny` → `xlarge`) |
| `app/view/hooks/useAppearanceColors.ts` | Shared text/accent/muted/surface colors |
| `app/editor/components/SelectedComponentPanel.tsx` | Selection shell + dimensions |
| `app/editor/components/component-options/` | Per-component editor options UI |
| `app/lib/i18n.tsx` | Editor and view strings (`nb` / `en`) |

---

## Folder Structure

Create a feature folder under `app/view/components/`:

```
my-widget/
├── index.tsx          # Root: panelSize logic, data fetching, variant switch
├── types.ts           # Props, PanelSize, domain types
├── utils.ts           # Formatting, parsing, demo data, API helpers
├── MyWidgetTiny.tsx   # Size-specific presentational components
├── MyWidgetSmall.tsx
├── MyWidgetMedium.tsx
├── MyWidgetLarge.tsx
├── MyWidgetXLarge.tsx
├── useMyWidget.ts     # (optional) animations, hooks
└── labels.ts          # (optional) component-local i18n
```

Not every component needs all five size variants. Map multiple `panelSize` values to the same variant when layouts are similar (see `calendar/index.tsx`).

All view components must be **client components** (`"use client"`).

---

## Step-by-Step Checklist

### 1. Choose a `componentId`

Use kebab-case, e.g. `"my-widget"`. This string is stored in layout config and used everywhere for matching.

### 2. Register in the component registry

Add an entry to `COMPONENT_LIBRARY` in `app/lib/component-registry.ts`:

```ts
{
  id: "my-widget",
  label: "My Widget",
  description: "Short description for the editor",
  labelNb: "Min widget",
  descriptionNb: "Kort beskrivelse for editoren",
  icon: FiActivity, // from react-icons/fi
  implemented: true,
  supportsOrientation: false, // optional
},
```

Then wire the live view component in `app/view/components/view-registry.tsx`:

```ts
import { MyWidget } from "./my-widget";

export const VIEW_COMPONENT_REGISTRY = {
  // ...existing entries
  "my-widget": { component: MyWidget },
};
```

Editor selection detection (`isMyWidget` in `SelectedComponentPanel`) is automatic via `buildComponentSelectionFlags()` — no manual `isDirect*` / `has*InPanel` blocks needed.

### 3. Extend the data model

Add a per-component appearance module under `app/lib/appearance/`:

```ts
// app/lib/appearance/my-widget.ts
export type MyWidgetAppearance = {
  myWidgetProvider?: "demo" | "api";
  myWidgetRefreshMinutes?: number;
};

export const myWidgetAppearanceDefaults: Required<MyWidgetAppearance> = {
  myWidgetProvider: "demo",
  myWidgetRefreshMinutes: 15,
};
```

Then wire it into `app/lib/appearance/index.ts` (`CellAppearance` intersection + `makeDefaultAppearance()`).

Persisted settings still live on the flat `CellAppearance` object (backward compatible with existing layouts).

### 4. Create the component folder

#### `types.ts`

```ts
import type { CellAppearance } from "../../../lib/layout-types";

export type MyWidgetProps = {
  appearance: CellAppearance;
  colSpan?: number;
  rowSpan?: number;
  totalGridSize?: number;
  orientation?: "landscape" | "portrait"; // only if layout depends on screen orientation
};

export type PanelSize = "tiny" | "small" | "medium" | "large" | "xlarge";
```

#### `index.tsx` (root component)

Responsibilities:

1. Read settings from `appearance`
2. Compute `panelSize` via `usePanelSize`
3. Fetch or derive data (if needed)
4. Switch to the correct size variant

```tsx
"use client";

import { usePanelSize } from "../../hooks/usePanelSize";
import { MyWidgetSmall } from "./MyWidgetSmall";
import { MyWidgetMedium } from "./MyWidgetMedium";
import type { MyWidgetProps } from "./types";

export function MyWidget({
  appearance,
  colSpan = 1,
  rowSpan = 1,
  totalGridSize,
  orientation,
}: MyWidgetProps) {
  const panelSize = usePanelSize(colSpan, rowSpan, totalGridSize, "standard");
  // Strategies: "standard" | "calendar" | "news"

  const commonProps = { appearance, colSpan, rowSpan, totalGridSize, orientation };

  switch (panelSize) {
    case "tiny":
    case "small":
      return <MyWidgetSmall {...commonProps} />;
    case "medium":
      return <MyWidgetMedium {...commonProps} />;
    default:
      return <MyWidgetMedium {...commonProps} />;
  }
}
```

For accent/muted colors in variants, prefer:

```tsx
import { useAppearanceColors } from "../../hooks/useAppearanceColors";

const { textColor, accentColor, mutedColor, borderColor } =
  useAppearanceColors(appearance);
```

#### Size variants

Keep variants **presentational**. Pass fetched data and loading state down from `index.tsx` rather than fetching in every variant.

```tsx
type MyWidgetSmallProps = MyWidgetProps & {
  data: MyWidgetData | null;
  loading: boolean;
  error: string | null;
};
```

### 5. Wire up the view (if not done in step 2)

`ComponentRenderer` reads from `VIEW_COMPONENT_REGISTRY` automatically. You only need to add your import and entry in `view-registry.tsx` — no changes to `ComponentRenderer.tsx` itself.

### 6. Add editor options

Create `app/editor/components/component-options/MyWidgetOptions.tsx` and register it in `ComponentOptionsPanel.tsx`:

```tsx
{componentSelection["my-widget"] ? (
  <MyWidgetOptions
    appearance={appearance}
    onAppearanceChange={onAppearanceChange}
    googleConnected={googleConnected}
    isFullScreen={isFullScreen}
    isClockQuarterOrMore={isClockQuarterOrMore}
    isTransportMediumOrLarge={isTransportMediumOrLarge}
  />
) : null}
```

Selection flags come from `buildComponentSelectionFlags()` automatically once the component is in `component-registry.ts`.

### 7. Add i18n strings

Add keys under `editor` in `app/lib/i18n.tsx` for both `nb` and `en`:

```ts
myWidgetProviderLabel: "Data source",
myWidgetProviderDemo: "Demo data",
```

Use in components via `const { t } = useI18n()` → `t("editor", "myWidgetProviderLabel")`.

### 8. Add an API route (if needed)

If the component needs secrets, OAuth, or server-side rate limiting, add a route under `app/api/` and call it from the client:

```ts
const response = await fetch("/api/my-widget?...", { signal: controller.signal });
```

See `app/api/google/calendar/route.ts` for OAuth + caching patterns.

---

## Common Patterns

### Panel size

`panelSize` is derived from `colSpan × rowSpan` relative to `totalGridSize` (`columns × rows`).

| Fraction of grid | Typical size |
|------------------|--------------|
| < 12.5% | `tiny` |
| 12.5–25% | `small` |
| 25–50% | `medium` |
| 50–75% | `large` |
| > 75% | `xlarge` |

Some components add aspect-ratio overrides (tall vs wide panels). See `news/index.tsx` for the most elaborate example; `calendar/index.tsx` for a simpler one.

Components can also pass flags to variants, e.g. `isExpanded` on `CalendarMedium` when the cell is between 25% and 50% of the grid.

### Appearance and styling

Shared visual props on every component:

- `backgroundColor`, `borderColor`, `borderRadius`, `borderWidth`, `textColor`

Typical usage in a variant:

```tsx
const textColor = appearance.textColor || "#ffffff";
const accentColor = appearance.borderColor || textColor;
```

Derive muted colors with helpers like `hexToRgba(textColor, 0.65)` from sibling `utils.ts` files.

Component-specific color overrides usually fall back to these shared props when unset.

### Orientation

`orientation` (`"landscape"` | `"portrait"`) is passed from layout config through `ComponentRenderer`. Only use it when layout genuinely differs — e.g. calendar week view switches between portrait list and landscape grid.

### Data fetching

**Preferred:** fetch in root `index.tsx`, pass data to variants.

| Pattern | When to use | Example |
|---------|-------------|---------|
| Client fetch + polling | Public APIs, RSS | `news/index.tsx` |
| Next.js API route | OAuth, secrets, rate limits | `api/google/calendar` |
| Demo fallback | Always | `buildSampleEvents()`, `calendarProvider === "demo"` |

Conventions:

- Use `AbortController` in `useEffect` cleanup
- Poll on an interval (e.g. 15–30 min) for live data
- Show demo/sample data when provider is `"demo"` or fetch fails
- Keep a `loading` / `error` state for graceful UI

### i18n

- **Global strings:** `app/lib/i18n.tsx` via `useI18n()`
- **Placeholder labels:** `labelNb` / `descriptionNb` in `placeholders.ts`
- **Component-local labels:** `labels.ts` with locale records (see `power/labels.ts`, `server/labels.ts`)
- **Date/number formatting:** `Intl.DateTimeFormat`, `toLocaleDateString("nb-NO", …)`

### Panels (playlists)

A `freeform-region` cell can cycle through multiple `panelEntries`, each with its own `componentId`, `duration`, and optional `appearance`. `PanelCell` handles cycling via `usePanelCycle`; your component receives merged appearance from the panel.

---

## Reference Implementations

| Component | Good for learning |
|-----------|-------------------|
| `calendar/` | Size variants, orientation, Google API + demo fallback, shared `utils.ts` |
| `news/` | Complex `panelSize` logic, RSS fetching in root, data passed to variants |
| `server/` | Client-side cache, status badges, component-local `labels.ts` |
| `power/` | External API, locale override via appearance |
| `transport/` | Animation hooks, real-time departures |

---

## Testing

1. Add the component to a layout in the **editor** (`/editor`)
2. Open the **player** (`/view` or `/view?layoutId=...`)
3. Resize the cell (change `colSpan` / `rowSpan`) to exercise size breakpoints
4. Test inside a **panel playlist** if the component has editor options
5. Test with `provider: "demo"` before wiring real integrations

The editor canvas shows placeholder icons only — always verify in the view player.

---

## Naming Conventions

| Concept | Convention | Example |
|---------|------------|---------|
| `componentId` | kebab-case | `"my-widget"` |
| Appearance fields | camelCase, prefixed | `myWidgetProvider` |
| Editor detection vars | `isDirect*` / `has*InPanel` / `is*` | `isMyWidget` |
| Size variant files | `PascalCase` + size | `MyWidgetLarge.tsx` |
| Root export | PascalCase, matches folder | `export function MyWidget` |

---

## Quick Checklist

- [ ] Entry in `component-registry.ts` (`implemented: true`)
- [ ] Entry in `view-registry.tsx`
- [ ] Appearance module in `lib/appearance/` + wired in `appearance/index.ts`
- [ ] Folder under `view/components/<name>/`
- [ ] `types.ts`, `utils.ts`, `index.tsx` using `usePanelSize`
- [ ] Data fetching in root `index.tsx` (not in size variants)
- [ ] Options file in `editor/components/component-options/` + `ComponentOptionsPanel`
- [ ] i18n keys in `i18n.tsx` (`nb` + `en`)
- [ ] API route (if secrets/OAuth needed)
- [ ] Demo data fallback
- [ ] Verified in `/view` at multiple cell sizes
