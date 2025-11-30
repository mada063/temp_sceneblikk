'use client';
import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import SimpleLayoutEditor from './SimpleLayoutEditor';
import AnimatedText from '@/components/AnimatedText';
import AnimatedParagraph from '@/components/AnimatedParagraph';

const Block = ({ id, label }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    border: '1px solid #ccc',
    padding: '1rem',
    margin: '0.5rem',
    borderRadius: '8px',
    background: 'white',
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      {label}
    </div>
  );
};

const DropZone = ({ id, children }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded-lg border-2 border-dashed p-4 min-h-[100px] flex items-center justify-center text-gray-500 transition-colors ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
    >
      {children}
    </div>
  );
};

const Byggeblokker = () => {
  const initialZones = ['zone-1', 'zone-2', 'zone-3', 'zone-4'];
  const [droppedItems, setDroppedItems] = useState({});

  const handleDragEnd = ({ active, over }) => {
    if (over) {
      setDroppedItems((prev) => ({
        ...prev,
        [over.id]: [...(prev[over.id] || []), active.id],
      }));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-7xl flex flex-col items-center gap-12">
        {/* Header text */}
        <div className="max-w-6xl flex ">
          <div className="w-full max-w-2/3 text-left">
            <h1 className='mb-8'>
              <AnimatedText 
                text="Våre byggeblokker"
                size="text-3xl md:text-4xl lg:text-6xl"
                primaryFont="font-serif"
                fontWeight="font-medium"
                order={0}
                className="mb-6"
              />
            </h1>
            <AnimatedParagraph 
              order={1}
              className="text-base md:text-lg"
            >
              Her er noen av funksjonene og integrasjonene i vårt lille system. Her finner du alt fra bilder til værmeldinger. Ved å bruke disse byggeblokkene har infoskjerm aldri vært lettere. Dra inn komponentene og se hvordan de legges til oppsettet.
            </AnimatedParagraph>
            <AnimatedParagraph 
              order={2}
              className="text-base md:text-lg mt-4"
            >
              Dersom det er noe du savner kan du gi oss en lyd, så skal vi legge det til!
            </AnimatedParagraph>
          </div>
        </div>

        {/* Layout and blocks side-by-side */}
        <div className="flex w-full gap-8">
          <SimpleLayoutEditor />
        </div>
      </div>
    </div>
  );
};

export default Byggeblokker;
