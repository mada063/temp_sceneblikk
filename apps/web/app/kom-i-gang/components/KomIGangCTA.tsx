"use client";

import React from 'react';
import { motion } from 'framer-motion';
import NextImage from 'next/image';
import Button from '@/components/Button';

// Type-safe wrapper for Next.js Image component
const Image = NextImage as any;
import Button2 from '@/components/Button2';
import AnimatedText from '@/components/AnimatedText';
import AnimatedParagraph from '@/components/AnimatedParagraph';
import { useI18n } from '@/app/i18n';

const KomIGangCTA = () => {
  const { locale } = useI18n();

  const heading =
    locale === 'nb' ? 'Klar til å starte?' : 'Ready to get started?';

  const body =
    locale === 'nb'
      ? 'Sceneblikk er helt gratis og kjøres i nettleseren. Du trenger kun en skjerm og en PC for å komme i gang.'
      : 'Sceneblikk is completely free and runs in your browser. You only need a screen and a computer to get started.';

  const primaryCta = locale === 'nb' ? 'Registrer nå' : 'Register now';
  const secondaryCta = locale === 'nb' ? 'Kontakt oss' : 'Contact us';

  return (
    <div className="flex items-center justify-center h-screen px-4">
      <div className="w-full max-w-6xl">
        <h1 className='mb-8'>
        <AnimatedText 
          text={heading}
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
            {body}
        </AnimatedParagraph>
        <div className="flex flex-row gap-4">
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Button href="https://app.sceneblikk.no/login">
              {primaryCta}
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Button2 href="/kontakt">
              {secondaryCta}
              </Button2>
            </motion.div>
          </div>
      </div>
    </div>
  );
};

export default KomIGangCTA;



