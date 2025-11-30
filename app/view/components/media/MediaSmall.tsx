"use client";

import { useState, useEffect } from "react";
import type { MediaProps, MediaItem } from "./types";

type MediaSmallProps = MediaProps & {
  items: MediaItem[];
  autoPlay?: boolean;
  transitionDuration?: number;
};

export function MediaSmall({ appearance, items, autoPlay = true, transitionDuration = 5 }: MediaSmallProps) {
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
        <div className="text-sm opacity-50" style={{ color: primaryColor }}>
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
      {currentItem.title && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2"
        >
          <div className="text-xs font-medium" style={{ color: primaryColor }}>
            {currentItem.title}
          </div>
        </div>
      )}
      {items.length > 1 && (
        <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-1.5">
          {items.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex ? "w-4 opacity-100" : "w-1.5 opacity-50"
              }`}
              style={{ backgroundColor: primaryColor }}
            />
          ))}
        </div>
      )}
    </div>
  );
}


