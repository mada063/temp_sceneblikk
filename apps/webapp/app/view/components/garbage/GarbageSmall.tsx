"use client";

import { FiTrash2 } from "react-icons/fi";
import type { GarbageProps } from "./types";
import type { GarbagePickup } from "./types";
import { getGarbageIcon } from "./utils";

const TrashIcon = FiTrash2 as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

type GarbageSmallProps = GarbageProps & {
  pickups: GarbagePickup[];
};

export function GarbageSmall({ appearance, pickups }: GarbageSmallProps) {
  const primaryColor = appearance.textColor || "#ffffff";

  if (pickups.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2" style={{ color: primaryColor }}>
        <TrashIcon className="h-12 w-12 opacity-50" />
        <span className="text-base opacity-80">Ingen tømmedager</span>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-4">
      <TrashIcon className="h-12 w-12 opacity-90" style={{ color: primaryColor }} />
      <div className="flex w-full max-w-xs flex-col gap-2">
        {pickups.slice(0, 3).map((p) => {
          const Icon = getGarbageIcon(p.iconKey);
          return (
            <div
              key={p.id}
              className="flex items-center justify-between gap-2 rounded-xl px-3 py-2"
              style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Icon className="h-4 w-4 flex-shrink-0 opacity-90" />
                {p.label}
              </span>
              <span className="text-sm font-semibold">{p.labelRelative}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
