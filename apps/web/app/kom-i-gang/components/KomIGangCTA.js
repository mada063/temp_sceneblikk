"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Button from '@/components/Button';
import Button2 from '@/components/Button2';
import AnimatedText from '@/components/AnimatedText';
import AnimatedParagraph from '@/components/AnimatedParagraph';

const KomIGangCTA = () => {
  return (
    <div className="flex items-center justify-center h-screen px-4">
      <div className="w-full max-w-6xl">
        <h1 className='mb-8'>
        <AnimatedText 
          text="Klar til å starte?"
          size="text-3xl md:text-4xl lg:text-6xl"
          primaryFont="font-serif"
          fontWeight="font-medium"
          order={0}
          className="mb-8"
        />
        </h1>
        <AnimatedParagraph 
          order={1}
          className="text-base md:text-lg lg:text-lg mb-12"
        >
            Sceneblikk er helt gratis og kjøres i nettleseren. Du trenger kun en skjerm og en PC for å komme i gang.
        </AnimatedParagraph>
        <div className="flex flex-row gap-4">
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Button href="https://app.sceneblikk.no/login">
                Registrer nå
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Button2 href="/kontakt">
                Kontakt oss
              </Button2>
            </motion.div>
          </div>
      </div>
    </div>
  );
};

export default KomIGangCTA;
