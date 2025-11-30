"use client";

import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DroppableZone from "./DroppableZone";
import DraggableBlock from "./DraggableBlock";
import { FaCog } from "react-icons/fa";

// Static example blocks
const exampleBlocks = [
  { id: "block1", name: "Været", type: "weather" },
  { id: "block2", name: "Reise", type: "trip" },
  { id: "block3", name: "Analog klokke", type: "clock" },
  { id: "block4", name: "Bilde", type: "image" },
  { id: "block5", name: "Video", type: "video" },
  { id: "block6", name: "Tekst", type: "text" },
  { id: "block7", name: "Nyheter", type: "news" },
  { id: "block8", name: "PDF", type: "pdf" },
  { id: "block9", name: "Kalender", type: "calendar" },
  { id: "block10", name: "Oppgaver", type: "tasks" },
];

export default function SimpleLayoutEditor() {
  const [zoneContent, setZoneContent] = useState({
    zone1: [],
    zone2: [],
    zone3: [],
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* Layout area */}
        <div className="glass-surface w-full lg:flex-1 p-6 rounded-2xl border border-white/40 dark:border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-custom-color-900 dark:text-white">Grid Editor</h3>
              <p className="text-sm text-custom-color-700/80 dark:text-custom-color-100/75">Dra komponenter inn i cellene for å bygge oppsettet</p>
            </div>
          </div>

          <div className="w-full aspect-video p-4 rounded-lg overflow-hidden border border-white/20 dark:border-white/10 shadow-inner bg-custom-color-50/50 dark:bg-custom-color-800/30">
            <div className="flex gap-3 w-full h-full">
              <DroppableZone
                id="zone1"
                label="Celle 1"
                zoneContent={zoneContent}
                setZoneContent={setZoneContent}
                className="flex-1"
              />
              <div className="flex flex-col gap-3 flex-1">
                <DroppableZone
                  id="zone2"
                  label="Celle 2"
                  zoneContent={zoneContent}
                  setZoneContent={setZoneContent}
                />
                <DroppableZone
                  id="zone3"
                  label="Celle 3"
                  zoneContent={zoneContent}
                  setZoneContent={setZoneContent}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Blocks to drag */}
        <div className="glass-surface p-6 rounded-2xl border border-white/40 dark:border-white/10 shadow-lg w-full lg:w-80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-custom-color-900 dark:text-white">Komponenter</h3>
              <p className="text-sm text-custom-color-700/80 dark:text-custom-color-100/75">Dra til cellene</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {exampleBlocks.map((block) => (
              <DraggableBlock key={block.id} bygg={block} />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
