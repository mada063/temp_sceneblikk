import type { CellAppearance } from "../../../lib/layout-types";
import type { ServerInfo } from "./types";
import type { ServerLabels } from "./labels";
import { getServerStatusLabel } from "./labels";

export const SERVER_STATUS_BADGE_DEFAULTS = {
  online: {
    backgroundColor: "#22c55e",
    borderColor: "#16a34a",
    color: "#ffffff",
  },
  offline: {
    backgroundColor: "#ef4444",
    borderColor: "#dc2626",
    color: "#ffffff",
  },
  unknown: {
    backgroundColor: "#f59e0b",
    borderColor: "#d97706",
    color: "#ffffff",
  },
} as const;

type BadgeAppearanceFields = Pick<
  CellAppearance,
  | "textColor"
  | "serverBadgeOnlineColor"
  | "serverBadgeOnlineBorder"
  | "serverBadgeOnlineText"
  | "serverBadgeOfflineColor"
  | "serverBadgeOfflineBorder"
  | "serverBadgeOfflineText"
  | "serverBadgeUnknownColor"
  | "serverBadgeUnknownBorder"
  | "serverBadgeUnknownText"
  | "serverStatusBadgeTransparent"
  | "serverStatusBadgeShowBorder"
  | "serverStatusBadgeShowText"
  | "serverStatusBadgeUseBackground"
  | "serverStatusBadgeUseBorder"
  | "serverStatusBadgeUseText"
>;

function isBadgeTransparent(appearance: BadgeAppearanceFields): boolean {
  if (appearance.serverStatusBadgeTransparent === true) {
    return true;
  }
  if (appearance.serverStatusBadgeUseBackground === false) {
    return true;
  }
  return false;
}

function isBadgeShowBorder(appearance: BadgeAppearanceFields): boolean {
  if (appearance.serverStatusBadgeShowBorder !== undefined) {
    return appearance.serverStatusBadgeShowBorder;
  }
  if (appearance.serverStatusBadgeUseBorder !== undefined) {
    return appearance.serverStatusBadgeUseBorder;
  }
  return true;
}

function isBadgeShowText(appearance: BadgeAppearanceFields): boolean {
  if (appearance.serverStatusBadgeShowText !== undefined) {
    return appearance.serverStatusBadgeShowText;
  }
  if (appearance.serverStatusBadgeUseText !== undefined) {
    return appearance.serverStatusBadgeUseText;
  }
  return true;
}

/** Colored background only when Transparent is off and at least border or text is shown. */
function shouldUseCustomBackground(appearance: BadgeAppearanceFields): boolean {
  if (isBadgeTransparent(appearance)) {
    return false;
  }
  return isBadgeShowBorder(appearance) || isBadgeShowText(appearance);
}

function getStatusColors(
  status: ServerInfo["status"],
  appearance: BadgeAppearanceFields
): { backgroundColor: string; borderColor: string; color: string } {
  const defaults = SERVER_STATUS_BADGE_DEFAULTS[status];
  const useBackground = shouldUseCustomBackground(appearance);
  const showBorder = isBadgeShowBorder(appearance);
  const showText = isBadgeShowText(appearance);
  const panelText = appearance.textColor || "#ffffff";

  if (status === "online") {
    return {
      backgroundColor: useBackground
        ? appearance.serverBadgeOnlineColor || defaults.backgroundColor
        : "transparent",
      borderColor: showBorder
        ? appearance.serverBadgeOnlineBorder || defaults.borderColor
        : "transparent",
      color: showText ? appearance.serverBadgeOnlineText || defaults.color : panelText,
    };
  }

  if (status === "offline") {
    return {
      backgroundColor: useBackground
        ? appearance.serverBadgeOfflineColor || defaults.backgroundColor
        : "transparent",
      borderColor: showBorder
        ? appearance.serverBadgeOfflineBorder || defaults.borderColor
        : "transparent",
      color: showText ? appearance.serverBadgeOfflineText || defaults.color : panelText,
    };
  }

  return {
    backgroundColor: useBackground
      ? appearance.serverBadgeUnknownColor || defaults.backgroundColor
      : "transparent",
    borderColor: showBorder
      ? appearance.serverBadgeUnknownBorder || defaults.borderColor
      : "transparent",
    color: showText ? appearance.serverBadgeUnknownText || defaults.color : panelText,
  };
}

export function getServerStatusBadgeStyle(
  status: ServerInfo["status"],
  appearance: BadgeAppearanceFields,
  labels: ServerLabels
): {
  label: string;
  backgroundColor: string;
  borderColor: string;
  color: string;
  showBorder: boolean;
  showText: boolean;
} {
  const colors = getStatusColors(status, appearance);
  const showBorder = isBadgeShowBorder(appearance);
  const showText = isBadgeShowText(appearance);

  return {
    label: showText ? getServerStatusLabel(status, labels) : "",
    ...colors,
    showBorder,
    showText,
  };
}
