import type { MutableRefObject, ReactNode } from "react";

import type { CellAppearance } from "../../../lib/layout-types";

export type ComponentOptionsContext = {
  appearance: CellAppearance;
  onAppearanceChange: (changes: Partial<CellAppearance>) => void;
  googleConnected: boolean | null;
  isFullScreen: boolean;
  isClockQuarterOrMore: boolean;
  isTransportMediumOrLarge: boolean;
};

export type AppearanceSectionProps = {
  appearance: CellAppearance;
  onAppearanceChange: (changes: Partial<CellAppearance>) => void;
  previousBorderWidthRef: MutableRefObject<number>;
  previousBackgroundColorRef: MutableRefObject<string>;
  children?: ReactNode;
};

export type ComponentSelectionFlags = Record<string, boolean>;
