"use client";

import { useState, useEffect } from "react";
import type { MediaProps, MediaItem } from "./types";

type MediaTinyProps = MediaProps & {
  items: MediaItem[];
  autoPlay?: boolean;
  transitionDuration?: number;
};

export function MediaTiny({ appearance, items, autoPlay = true, transitionDuration = 5 }: MediaTinyProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, transitionDuration * 1000);

    return () => clearInterval(interval);
  }, [autoPlay, items.length, transitionDuration]);

  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-xs opacity-50" style={{ color: primaryColor }}>
          No media
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div className="relative h-full w-full overflow-hidden">
      {currentItem.type === "image" ? (
        <img
          src={currentItem.url}
          alt={currentItem.title || "Media"}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <video
          src={currentItem.url}
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
      {items.length > 1 && (
        <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-1">
          {items.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all ${
                idx === currentIndex ? "w-3 opacity-100" : "w-1 opacity-50"
              }`}
              style={{ backgroundColor: primaryColor }}
            />
          ))}
        </div>
      )}
    </div>
  );
}


