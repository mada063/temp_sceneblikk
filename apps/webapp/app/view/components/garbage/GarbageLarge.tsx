"use client";

import { FiTrash2 } from "react-icons/fi";
import type { GarbageProps } from "./types";
import { formatGarbageDate, getGarbageIcon } from "./utils";
import type { GarbagePickup } from "./types";

const TrashIcon = FiTrash2 as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

type GarbageLargeProps = GarbageProps & {
  pickups: GarbagePickup[];
};

export function GarbageLarge({ appearance, pickups }: GarbageLargeProps) {
  const primaryColor = appearance.textColor || "#ffffff";

  if (pickups.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2" style={{ color: primaryColor }}>
        <TrashIcon className="h-20 w-20 opacity-50" />
        <span className="text-lg opacity-80">Ingen tømmedager</span>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 px-8">
      <TrashIcon className="h-16 w-16 opacity-90" style={{ color: primaryColor }} />
      <div className="w-full max-w-md space-y-3">
        {pickups.map((p) => {
          const Icon = getGarbageIcon(p.iconKey);
          return (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-2xl px-5 py-3"
              style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
            >
              <span className="flex items-center gap-2.5 text-base font-medium">
                <Icon className="h-5 w-5 flex-shrink-0 opacity-90" />
                {p.label}
              </span>
              <div className="text-right">
                <div className="text-base font-semibold">{p.labelRelative}</div>
                <div className="text-sm opacity-80">{formatGarbageDate(p.nextDate, "24h")}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
