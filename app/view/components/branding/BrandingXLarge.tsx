"use client";

import type { BrandingProps, PanelSize } from "./types";

type BrandingXLargeProps = BrandingProps & {
  logoUrl?: string;
  text?: string;
  panelSize?: PanelSize;
};

export function BrandingXLarge({ appearance, logoUrl, text, panelSize = "xlarge" }: BrandingXLargeProps) {
  const primaryColor = appearance.textColor || "#ffffff";

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-6 py-4">
      {logoUrl && (
        <img
          src={logoUrl}
          alt="Logo"
          className="max-h-4/5 max-w-full object-contain"
        />
      )}
      {text && (
        <div
          className="text-center font-bold uppercase tracking-wider"
          style={{ color: primaryColor, fontSize: "1.25rem" }}
        >
          {text}
        </div>
      )}
    </div>
  );
}

