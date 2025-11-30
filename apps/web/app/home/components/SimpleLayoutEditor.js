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
      <div className="flex flex-col gap-6 p-6 w-full">

        <div className="flex flex-row gap-6">
        {/* Layout area */}
        <div className="bg-white w-full aspect-video p-4 rounded-lg">

          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-black">Mitt oppsett</h3>
              <p className="text-sm text-gray-600">Et enkelt 3-delt oppsett</p>
            </div>
          </div>

          <div className="w-full aspect-video p-4 rounded-lg overflow-hidden border border-gray-300 shadow-inner bg-gray-100">
            <div className="flex gap-3 w-full h-full">
              <DroppableZone
                id="zone1"
                label="Sone 1"
                zoneContent={zoneContent}
                setZoneContent={setZoneContent}
                className="flex-1"
              />
              <div className="flex flex-col gap-3 flex-1">
                <DroppableZone
                  id="zone2"
                  label="Sone 2"
                  zoneContent={zoneContent}
                  setZoneContent={setZoneContent}
                />
                <DroppableZone
                  id="zone3"
                  label="Sone 3"
                  zoneContent={zoneContent}
                  setZoneContent={setZoneContent}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Blocks to drag */}
        <div className="bg-white p-4 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-black">Byggeblokker</h3>
              <p className="text-sm text-gray-600">Her er noen byggeblokker som kan brukes</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {exampleBlocks.map((block) => (
              <DraggableBlock key={block.id} bygg={block} />
            ))}
          </div>
        </div>
      </div>
      </div>
    </DndProvider>
  );
}
