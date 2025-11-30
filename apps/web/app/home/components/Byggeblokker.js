'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FiCloud, FiRadio, FiClock, FiImage, FiVideo, FiMapPin, FiType, FiBell } from 'react-icons/fi';
import AnimatedText from '@/components/AnimatedText';
import AnimatedParagraph from '@/components/AnimatedParagraph';

const components = [
  {
    title: 'Vær',
    icon: FiCloud,
    description:
      'Vis sanntids værdata med temperatur, ikoner og grafer for kommende timer og dager.',
  },
  {
    title: 'Nyheter',
    icon: FiRadio,
    description:
      'Rullerende nyhetsticker eller listevisning med siste oppdateringer fra valgte kilder.',
  },
  {
    title: 'Klokker',
    icon: FiClock,
    description:
      'Analog og digital klokke med støtte for ulike tidssoner og stilvarianter.',
  },
  {
    title: 'Bilder',
    icon: FiImage,
    description:
      'Vis statiske bilder, logoer og illustrasjoner med tilpasset skalering og plassering.',
  },
  {
    title: 'Video',
    icon: FiVideo,
    description:
      'Spill av videoer i loop eller etter tidsplan. Perfekt for kampanjer og infofilmer.',
  },
  {
    title: 'Transport',
    icon: FiMapPin,
    description:
      'Sanntidsinformasjon om avgangs- og ankomsttider fra utvalgte holdeplasser og stasjoner.',
  },
  {
    title: 'Tekst og kunngjøringer',
    icon: FiType,
    description:
      'Frie tekstfelt for meldinger, beskjedtavler og praktisk informasjon.',
  },
  {
    title: 'Branding',
    icon: FiBell,
    description:
      'Logoer, farger og faste elementer som gir et helhetlig visuelt uttrykk.',
  },
];

const Byggeblokker = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-7xl flex flex-col items-center gap-12">
        {/* Header text */}
        <div className="max-w-6xl flex">
          <div className="w-full text-left text-custom-color-900 dark:text-white">
            <h1 className="mb-8">
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
              Hver skjerm bygges opp av komponenter. Kombiner vær, nyheter, klokker, media og
              transportdata i samme oppsett, og tilpass hver byggekloss til din visuelle profil.
            </AnimatedParagraph>
          </div>
        </div>

        {/* Component boxes */}
        <div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-4">
          {components.map((comp, index) => (
            <motion.div
              key={comp.title}
              className="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/80 p-6 text-custom-color-900 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-custom-color-800/70 dark:text-white"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.05 * index, duration: 0.35 }}
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-custom-color-100/40 via-transparent to-custom-color-300/35 opacity-0 transition group-hover:opacity-100 dark:from-custom-color-700/25 dark:to-custom-color-500/35" />
              <div className="flex flex-col gap-3 text-left h-full">
                <div className="inline-flex items-center justify-center rounded-xl bg-custom-color-500/15 p-3 text-custom-color-600 dark:bg-custom-color-400/20 dark:text-custom-color-200">
                  <comp.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-custom-color-900 dark:text-white">
                  {comp.title}
                </h3>
                <p className="text-sm text-custom-color-700/80 dark:text-custom-color-100/75">
                  {comp.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Byggeblokker;
