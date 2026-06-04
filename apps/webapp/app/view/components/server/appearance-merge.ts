import {
  cloneAppearance,
  makeDefaultAppearance,
  type CellAppearance,
} from "../../../lib/layout-types";

const BADGE_TOGGLE_KEYS = [
  "serverStatusBadgeTransparent",
  "serverStatusBadgeShowBorder",
  "serverStatusBadgeShowText",
  "serverStatusBadgeRadius",
] as const;

/** Badge toggle/color fields are owned by the panel; entry supplies server URLs and overrides. */
export function mergeServerAppearance(
  panelAppearance: CellAppearance,
  entryAppearance?: CellAppearance | null
): CellAppearance {
  const panel = { ...makeDefaultAppearance(), ...panelAppearance };
  if (!entryAppearance) {
    return panel;
  }

  const entry = { ...entryAppearance };

  return {
    ...panel,
    ...entry,
    serverUrls: entry.serverUrls ?? panel.serverUrls,
    serverLanguage: entry.serverLanguage ?? panel.serverLanguage,
    serverType: entry.serverType ?? panel.serverType,
    serverStatusBadgeTransparent: panel.serverStatusBadgeTransparent,
    serverStatusBadgeShowBorder: panel.serverStatusBadgeShowBorder,
    serverStatusBadgeShowText: panel.serverStatusBadgeShowText,
    serverStatusBadgeRadius: panel.serverStatusBadgeRadius,
    serverBadgeOnlineColor: entry.serverBadgeOnlineColor ?? panel.serverBadgeOnlineColor,
    serverBadgeOnlineBorder: entry.serverBadgeOnlineBorder ?? panel.serverBadgeOnlineBorder,
    serverBadgeOnlineText: entry.serverBadgeOnlineText ?? panel.serverBadgeOnlineText,
    serverBadgeOfflineColor: entry.serverBadgeOfflineColor ?? panel.serverBadgeOfflineColor,
    serverBadgeOfflineBorder: entry.serverBadgeOfflineBorder ?? panel.serverBadgeOfflineBorder,
    serverBadgeOfflineText: entry.serverBadgeOfflineText ?? panel.serverBadgeOfflineText,
    serverBadgeUnknownColor: entry.serverBadgeUnknownColor ?? panel.serverBadgeUnknownColor,
    serverBadgeUnknownBorder: entry.serverBadgeUnknownBorder ?? panel.serverBadgeUnknownBorder,
    serverBadgeUnknownText: entry.serverBadgeUnknownText ?? panel.serverBadgeUnknownText,
  };
}

export function pickServerBadgeToggleChanges(
  changes: Partial<CellAppearance>
): Partial<CellAppearance> {
  const picked: Partial<CellAppearance> = {};
  for (const key of BADGE_TOGGLE_KEYS) {
    if (key in changes && changes[key] !== undefined) {
      (picked as Record<string, unknown>)[key] = changes[key];
    }
  }
  return picked;
}

export function applyServerBadgeTogglesToPanel(
  panelAppearance: CellAppearance | undefined,
  changes: Partial<CellAppearance>
): CellAppearance {
  const base = panelAppearance
    ? cloneAppearance(panelAppearance) ?? makeDefaultAppearance()
    : makeDefaultAppearance();
  return { ...base, ...pickServerBadgeToggleChanges(changes) };
}
