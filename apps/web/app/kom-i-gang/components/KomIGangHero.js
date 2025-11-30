"use client";

import React from 'react';
import { motion } from 'framer-motion';
import AnimatedText from '@/components/AnimatedText';
import AnimatedParagraph from '@/components/AnimatedParagraph';
import Button from '@/components/Button';

const KomIGangHero = () => {
  return (
    <div className="flex items-center justify-center pt-[35vh] px-4">
      <div className="text-center max-w-6xl">
        <h1 className="mb-8">
          <AnimatedText 
            text="Kom i gang med Sceneblikk"
            size="text-4xl md:text-5xl lg:text-7xl"
            primaryFont="font-serif"
            fontWeight="font-medium"
            order={0}
          />
        </h1>
        <AnimatedParagraph 
          order={1}
          className="text-xl md:text-2xl lg:text-3xl mb-8 max-w-4xl mx-auto"
        >
          Følg disse enkle stegene for å komme raskt i gang med moderne digital skilting
        </AnimatedParagraph>
      </div>
    </div>
  );
};

export default KomIGangHero;
