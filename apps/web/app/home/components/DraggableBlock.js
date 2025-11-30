"use client";

import React from "react";
import { useDrag } from "react-dnd";
import { getIcon } from "@/lib/getIcon";

export default function DraggableBlock({ bygg }) {
  const [, drag] = useDrag(() => ({
    type: "byggeblokk",
    item: { bygg },
  }));

  return (
    <div
      ref={drag}
      className="glass-surface p-3 rounded-lg cursor-grab hover:-translate-y-0.5 hover:shadow-md transition border border-white/20 dark:border-white/10 group"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="text-custom-color-600 dark:text-custom-color-300">{getIcon(bygg.type)}</div>
        <strong className="text-sm text-custom-color-900 dark:text-white font-semibold">{bygg.name}</strong>
      </div>
      <div className="text-xs text-custom-color-600/70 dark:text-custom-color-300/70 capitalize">{bygg.type}</div>
    </div>
  );
}