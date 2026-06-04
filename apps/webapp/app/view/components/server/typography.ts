/** Header and list row font sizes (aligned with transport stop titles per panel size). */
export type ServerTypography = {
  titleFontSize: string;
};

export const SERVER_TYPOGRAPHY = {
  small: { titleFontSize: "0.75rem" },
  medium: { titleFontSize: "0.75rem" },
  large: { titleFontSize: "1rem" },
  xlarge: { titleFontSize: "1.25rem" },
} as const satisfies Record<string, ServerTypography>;
