"use client";

import { FiTrash2 } from "react-icons/fi";
import type { GarbageProps } from "./types";
import { formatGarbageDate, getGarbageIcon } from "./utils";
import type { GarbagePickup } from "./types";

const TrashIcon = FiTrash2 as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

type GarbageXLargeProps = GarbageProps & {
  pickups: GarbagePickup[];
};

export function GarbageXLarge({ appearance, pickups }: GarbageXLargeProps) {
  const primaryColor = appearance.textColor || "#ffffff";

  if (pickups.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2" style={{ color: primaryColor }}>
        <TrashIcon className="h-24 w-24 opacity-50" />
        <span className="text-xl opacity-80">Ingen tømmedager</span>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-10">
      <TrashIcon className="h-20 w-20 opacity-90" style={{ color: primaryColor }} />
      <div className="w-full max-w-lg space-y-4">
        {pickups.map((p) => {
          const Icon = getGarbageIcon(p.iconKey);
          return (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-2xl px-6 py-4"
              style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
            >
              <span className="flex items-center gap-2.5 text-lg font-medium">
                <Icon className="h-6 w-6 flex-shrink-0 opacity-90" />
                {p.label}
              </span>
              <div className="text-right">
                <div className="text-lg font-semibold">{p.labelRelative}</div>
                <div className="text-base opacity-80">{formatGarbageDate(p.nextDate, "24h")}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
