import { useMemo } from "react";

import type { CellAppearance } from "../../lib/appearance";
import { hexToRgba, getReadableTextColor } from "../../lib/color-utils";

export type AppearanceColorOverrides = {
  accentColor?: string;
  mutedColor?: string;
  surfaceColor?: string;
  highlightColor?: string;
};

export function resolveAppearanceColors(
  appearance: CellAppearance,
  overrides: AppearanceColorOverrides = {},
) {
  const textColor = appearance.textColor || "#ffffff";
  const accentColor =
    overrides.accentColor?.trim() !== ""
      ? overrides.accentColor!
      : appearance.borderColor || textColor;
  const mutedColor =
    overrides.mutedColor?.trim() !== ""
      ? overrides.mutedColor!
      : hexToRgba(textColor, 0.65);
  const surfaceColor =
    overrides.surfaceColor?.trim() !== ""
      ? overrides.surfaceColor!
      : hexToRgba(textColor, 0.05);
  const highlightColor =
    overrides.highlightColor?.trim() !== ""
      ? overrides.highlightColor!
      : hexToRgba(accentColor, 0.2);
  const borderColor = hexToRgba(accentColor, 0.25);
  const accentTextColor = getReadableTextColor(accentColor, "#0f172a");

  return {
    textColor,
    accentColor,
    mutedColor,
    surfaceColor,
    highlightColor,
    borderColor,
    accentTextColor,
    getReadableTextColor,
    hexToRgba,
  };
}

export function useAppearanceColors(
  appearance: CellAppearance,
  overrides: AppearanceColorOverrides = {},
) {
  return useMemo(
    () => resolveAppearanceColors(appearance, overrides),
    [
      appearance.textColor,
      appearance.borderColor,
      overrides.accentColor,
      overrides.mutedColor,
      overrides.surfaceColor,
      overrides.highlightColor,
    ],
  );
}

export function useCalendarAppearanceColors(appearance: CellAppearance) {
  return useAppearanceColors(appearance, {
    accentColor: appearance.calendarAccentColor,
    mutedColor: appearance.calendarMutedColor,
    surfaceColor: appearance.calendarCellBackground,
    highlightColor: appearance.calendarTodayHighlight,
  });
}
