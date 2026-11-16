"use client";

import { useState, useEffect } from "react";
import type { MediaProps, MediaItem } from "./types";

type MediaXLargeProps = MediaProps & {
  items: MediaItem[];
  autoPlay?: boolean;
  transitionDuration?: number;
};

export function MediaXLarge({ appearance, items, autoPlay = true, transitionDuration = 5 }: MediaXLargeProps) {
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
        <div className="text-[1.25rem] opacity-50" style={{ color: primaryColor }}>
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
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6"
        >
          <div className="text-[1.25rem] font-semibold" style={{ color: primaryColor }}>
            {currentItem.title}
          </div>
        </div>
      )}
      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2.5">
          {items.map((_, idx) => (
            <div
              key={idx}
              className={`h-2.5 rounded-full transition-all ${
                idx === currentIndex ? "w-10 opacity-100" : "w-2.5 opacity-50"
              }`}
              style={{ backgroundColor: primaryColor }}
            />
          ))}
        </div>
      )}
    </div>
  );
}


