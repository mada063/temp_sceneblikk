"use client";

import { useState } from "react";
import type { BrandingProps, PanelSize } from "./types";

type BrandingLargeProps = BrandingProps & {
  logoUrl?: string;
  text?: string;
  panelSize?: PanelSize;
};

export function BrandingLarge({ appearance, logoUrl, text, panelSize = "large" }: BrandingLargeProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  const [logoError, setLogoError] = useState(false);

  const hasLogo = logoUrl && !logoError;
  const hasText = text;

  // Layout: horizontal for large panels when both elements present
  const layoutType = hasLogo && hasText ? "logo-text" : "single";

  return (
    <div className="flex h-full w-full items-center justify-center px-6 py-4">
      <div className={`flex ${layoutType === "logo-text" ? "flex-row items-center gap-6" : "flex-col items-center gap-4"} max-w-full`}>
        {/* Logo Section */}
        {logoUrl && (
          <div className="flex-shrink-0">
            {!logoError ? (
              <img
                src={logoUrl}
                alt="Logo"
                onError={() => setLogoError(true)}
                className="max-h-40 max-w-64 object-contain drop-shadow-md"
              />
            ) : (
              <div 
                className="flex h-32 w-48 items-center justify-center rounded-lg border-2 border-dashed opacity-50"
                style={{ borderColor: primaryColor }}
              >
                <span className="text-sm" style={{ color: primaryColor }}>Logo</span>
              </div>
            )}
          </div>
        )}

        {/* Text Section */}
        {text && (
          <div className={`${layoutType === "logo-text" ? "flex-1" : ""}`}>
            <div
              className="text-center font-bold uppercase tracking-wider"
              style={{ color: primaryColor, fontSize: "1rem" }}
            >
              {text}
            </div>
          </div>
        )}

        {/* Fallback */}
        {!hasLogo && !hasText && (
          <div className="text-center opacity-50" style={{ color: primaryColor }}>
            <p className="text-base">Add logo or text</p>
          </div>
        )}
      </div>
    </div>
  );
}

