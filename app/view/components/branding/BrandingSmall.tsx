"use client";

import type { BrandingProps, PanelSize } from "./types";

type BrandingSmallProps = BrandingProps & {
  logoUrl?: string;
  text?: string;
  panelSize?: PanelSize;
};

export function BrandingSmall({ appearance, logoUrl, text, panelSize = "small" }: BrandingSmallProps) {
  const primaryColor = appearance.textColor || "#ffffff";

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 animate-fade-in">
      {logoUrl && (
        <img
          src={logoUrl}
          alt="Logo"
          className="max-h-3/4 max-w-full object-contain"
        />
      )}
      {text && (
        <div
          className="text-center font-bold uppercase tracking-wider"
          style={{ color: primaryColor, fontSize: "0.75rem" }}
        >
          {text}
        </div>
      )}
    </div>
  );
}

