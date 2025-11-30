"use client";

import type { BrandingProps, PanelSize } from "./types";

type BrandingTinyProps = BrandingProps & {
  logoUrl?: string;
  text?: string;
  panelSize?: PanelSize;
};

export function BrandingTiny({ appearance, logoUrl, text, panelSize = "tiny" }: BrandingTinyProps) {
  const primaryColor = appearance.textColor || "#ffffff";

  return (
    <div className="flex h-full w-full items-center justify-center px-2">
      {logoUrl && (
        <img
          src={logoUrl}
          alt="Logo"
          className="max-h-full max-w-full object-contain"
        />
      )}
      {!logoUrl && text && (
        <div
          className="text-center font-bold uppercase tracking-wider"
          style={{ color: primaryColor, fontSize: "0.5rem" }}
        >
          {text}
        </div>
      )}
    </div>
  );
}

