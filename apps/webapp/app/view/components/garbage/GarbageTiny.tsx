"use client";

import { FiTrash2 } from "react-icons/fi";
import type { GarbageProps } from "./types";
import type { GarbagePickup } from "./types";
import { getGarbageIcon } from "./utils";

const TrashIcon = FiTrash2 as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

type GarbageTinyProps = GarbageProps & {
  pickups: GarbagePickup[];
};

export function GarbageTiny({ appearance, pickups }: GarbageTinyProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  const next = pickups[0];

  if (!next) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2" style={{ color: primaryColor }}>
        <TrashIcon className="h-10 w-10 opacity-50" />
        <span className="text-sm opacity-80">Ingen tømming</span>
      </div>
    );
  }

  const Icon = getGarbageIcon(next.iconKey);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2">
      <Icon className="h-12 w-12 opacity-90" style={{ color: primaryColor }} />
      <span className="text-center text-base font-semibold" style={{ color: primaryColor }}>
        {next.label}
      </span>
      <span className="text-center text-sm opacity-90" style={{ color: primaryColor }}>
        {next.labelRelative}
      </span>
    </div>
  );
}
