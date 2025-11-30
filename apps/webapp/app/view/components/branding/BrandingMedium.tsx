"use client";

import { useState } from "react";
import type { BrandingProps, PanelSize } from "./types";

type BrandingMediumProps = BrandingProps & {
  logoUrl?: string;
  text?: string;
  panelSize?: PanelSize;
};

export function BrandingMedium({ appearance, logoUrl, text, panelSize = "medium" }: BrandingMediumProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  const [logoError, setLogoError] = useState(false);

  const hasLogo = logoUrl && !logoError;
  const hasText = text;

  // Determine layout based on what's available
  const layoutType = hasLogo && hasText ? "logo-text" : "single";

  return (
    <div className="flex h-full w-full items-center justify-center px-4 py-3">
      <div className={`flex ${layoutType === "logo-text" ? "flex-row items-center gap-4" : "flex-col items-center gap-3"} max-w-full`}>
        {/* Logo Section */}
        {logoUrl && (
          <div className="flex-shrink-0">
            {!logoError ? (
              <img
                src={logoUrl}
                alt="Logo"
                onError={() => setLogoError(true)}
                className="max-h-32 max-w-48 object-contain drop-shadow-sm"
              />
            ) : (
              <div 
                className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed opacity-50"
                style={{ borderColor: primaryColor }}
              >
                <span className="text-xs" style={{ color: primaryColor }}>Logo</span>
              </div>
            )}
          </div>
        )}

        {/* Text Section */}
        {text && (
          <div className={`${layoutType === "logo-text" ? "flex-1" : ""}`}>
            <div
              className="text-center font-bold uppercase tracking-wider"
              style={{ color: primaryColor, fontSize: "0.875rem" }}
            >
              {text}
            </div>
          </div>
        )}

        {/* Fallback when nothing is available */}
        {!hasLogo && !hasText && (
          <div className="text-center opacity-50" style={{ color: primaryColor }}>
            <p className="text-sm">Add logo or text</p>
          </div>
        )}
      </div>
    </div>
  );
}

