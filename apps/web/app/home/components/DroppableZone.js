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
      className={`flex flex-col w-full h-full p-2 rounded-md transition ${isOver ? "bg-green-400" : "bg-custom-600"} text-white ${className}`}
    >
      <div className="font-semibold mb-1">{label}</div>

      <div className="grid grid-cols-2 gap-2 overflow-auto">
        {zoneContent[id]?.map((block, i) => (
            <div
                key={i}
                className="bg-white text-black p-2 rounded flex items-center gap-2 cursor-pointer hover:bg-gray-100 h-fit"
            >
                <div className="shrink-0">{getIcon(block.type)}</div>
                <span className="flex-1 truncate">{block.name}</span>
                <button
                onClick={() => removeBlock(i)}
                className="text-red-600 text-sm ml-1 shrink-0"
                >
                ✕
                </button>
            </div>
            ))}

      </div>

      {zoneContent[id]?.length === 0 && (
        <div className="text-gray-200 mt-2">Slipp byggeblokker her</div>
      )}
    </div>
  );
}