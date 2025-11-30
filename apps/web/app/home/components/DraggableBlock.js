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
      className="bg-custom-200 text-black p-2 rounded cursor-grab hover:opacity-80 min-w-36"
    >
      {getIcon(bygg.type)}
      <strong>{bygg.name}</strong>
      <div className="text-xs text-gray-500">{bygg.type}</div>
    </div>
  );
}