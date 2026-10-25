export type ServerAppearance = {
  /** @deprecated Legacy global mode; per-URL detection is used when mixed entries are configured */
  serverType?: string;
  serverUrls?: string[];
  serverBadgeOnlineColor?: string;
  serverBadgeOnlineBorder?: string;
  serverBadgeOnlineText?: string;
  serverBadgeOfflineColor?: string;
  serverBadgeOfflineBorder?: string;
  serverBadgeOfflineText?: string;
  serverBadgeUnknownColor?: string;
  serverBadgeUnknownBorder?: string;
  serverBadgeUnknownText?: string;
  serverStatusBadgeRadius?: number;
  serverStatusBadgeTransparent?: boolean;
  serverStatusBadgeShowBorder?: boolean;
  serverStatusBadgeShowText?: boolean;
  /** @deprecated Use serverStatusBadgeTransparent (inverted) */
  serverStatusBadgeUseBackground?: boolean;
  /** @deprecated Use serverStatusBadgeShowBorder */
  serverStatusBadgeUseBorder?: boolean;
  /** @deprecated Use serverStatusBadgeShowText */
  serverStatusBadgeUseText?: boolean;
  serverLanguage?: "nb" | "en";
};

export const serverAppearanceDefaults: Required<
  Pick<
    ServerAppearance,
    | "serverType"
    | "serverUrls"
    | "serverBadgeOnlineColor"
    | "serverBadgeOnlineBorder"
    | "serverBadgeOnlineText"
    | "serverBadgeOfflineColor"
    | "serverBadgeOfflineBorder"
    | "serverBadgeOfflineText"
    | "serverBadgeUnknownColor"
    | "serverBadgeUnknownBorder"
    | "serverBadgeUnknownText"
    | "serverStatusBadgeRadius"
    | "serverStatusBadgeTransparent"
    | "serverStatusBadgeShowBorder"
    | "serverStatusBadgeShowText"
  >
> = {
  serverType: "website",
  serverUrls: [],
  serverBadgeOnlineColor: "#22c55e",
  serverBadgeOnlineBorder: "#16a34a",
  serverBadgeOnlineText: "#ffffff",
  serverBadgeOfflineColor: "#ef4444",
  serverBadgeOfflineBorder: "#dc2626",
  serverBadgeOfflineText: "#ffffff",
  serverBadgeUnknownColor: "#f59e0b",
  serverBadgeUnknownBorder: "#d97706",
  serverBadgeUnknownText: "#ffffff",
  serverStatusBadgeRadius: 10,
  serverStatusBadgeTransparent: false,
  serverStatusBadgeShowBorder: true,
  serverStatusBadgeShowText: true,
};
