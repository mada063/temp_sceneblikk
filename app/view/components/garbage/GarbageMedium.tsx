"use client";

import { FiTrash2 } from "react-icons/fi";
import type { GarbageProps } from "./types";
import type { GarbagePickup } from "./types";
import { getGarbageIcon } from "./utils";

const TrashIcon = FiTrash2 as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

type GarbageMediumProps = GarbageProps & {
  pickups: GarbagePickup[];
};

export function GarbageMedium({ appearance, pickups }: GarbageMediumProps) {
  const primaryColor = appearance.textColor || "#ffffff";

  if (pickups.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2" style={{ color: primaryColor }}>
        <TrashIcon className="h-16 w-16 opacity-50 animate-pulse" />
        <span className="text-base opacity-80">Ingen tømmedager</span>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6">
      <TrashIcon className="h-14 w-14 opacity-90 animate-fade-in" style={{ color: primaryColor }} />
      <div className="w-full max-w-sm space-y-2">
        {pickups.slice(0, 5).map((p, idx) => {
          const Icon = getGarbageIcon(p.iconKey);
          return (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 animate-fade-in"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, animationDelay: `${0.2 + idx * 0.1}s`, animationFillMode: "both" }}
            >
              <span className="flex items-center gap-2 text-base font-medium">
                <Icon className="h-5 w-5 flex-shrink-0 opacity-90" />
                {p.label}
              </span>
              <span className="text-base font-semibold">{p.labelRelative}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
