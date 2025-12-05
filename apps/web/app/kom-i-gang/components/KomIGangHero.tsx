"use client";

import React from 'react';
import { motion } from 'framer-motion';
import AnimatedText from '@/components/AnimatedText';
import AnimatedParagraph from '@/components/AnimatedParagraph';
import Button from '@/components/Button';
import { useI18n } from '@/app/i18n';

const KomIGangHero = () => {
  const { locale } = useI18n();

  const heading =
    locale === 'nb'
      ? 'Kom i gang med Sceneblikk'
      : 'Get started with Sceneblikk';

  const subheading =
    locale === 'nb'
      ? 'Følg disse enkle stegene for å komme raskt i gang med moderne digital skilting.'
      : 'Follow these simple steps to get up and running with modern digital signage in minutes.';

  return (
    <div className="flex items-center justify-center pt-[35vh] px-4">
      <div className="text-center max-w-6xl">
        <h1 className="mb-8">
          <AnimatedText 
            text={heading}
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
          {subheading}
        </AnimatedParagraph>
      </div>
    </div>
  );
};

export default KomIGangHero;



