"use client";

import React from "react";
import { useDrop } from "react-dnd";
import { getIcon } from "@/lib/getIcon";

export default function DroppableZone({ id, zoneContent, setZoneContent, label, className = "" }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "byggeblokk",
    drop: (item) => {
      setZoneContent((prev) => ({
        ...prev,
        [id]: [...(prev[id] || []), item.bygg],
      }));
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const removeBlock = (index) => {
    setZoneContent((prev) => ({
      ...prev,
      [id]: prev[id].filter((_, i) => i !== index),
    }));
  };

  return (
    <div
      ref={drop}
      className={`flex flex-col w-full h-full p-3 rounded-lg transition border-2 border-dashed ${
        isOver 
          ? "bg-custom-color-400/20 border-custom-color-400 dark:bg-custom-color-400/30 dark:border-custom-color-300" 
          : "bg-white/50 dark:bg-custom-color-800/50 border-custom-color-300/30 dark:border-white/10"
      } ${className}`}
    >
      <div className="font-semibold mb-2 text-sm text-custom-color-800 dark:text-custom-color-100">{label}</div>

      <div className="flex flex-col gap-2 overflow-auto flex-1">
        {zoneContent[id]?.map((block, i) => (
            <div
                key={i}
                className="glass-surface-strong p-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-white/80 dark:hover:bg-custom-color-700/80 transition border border-white/20 dark:border-white/5"
            >
                <div className="shrink-0 text-custom-color-600 dark:text-custom-color-300">{getIcon(block.type)}</div>
                <span className="flex-1 truncate text-sm text-custom-color-900 dark:text-white font-medium">{block.name}</span>
                <button
                onClick={() => removeBlock(i)}
                className="text-red-500 dark:text-red-400 text-sm ml-1 shrink-0 hover:text-red-600 dark:hover:text-red-300 transition"
                >
                ✕
                </button>
            </div>
            ))}

      </div>

      {zoneContent[id]?.length === 0 && (
        <div className="text-custom-color-500/60 dark:text-custom-color-300/60 text-xs mt-auto text-center py-4">
          Slipp komponenter her
        </div>
      )}
    </div>
  );
}