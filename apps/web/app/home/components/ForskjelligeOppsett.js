"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { FiGrid, FiMaximize2, FiLayers, FiDroplet } from 'react-icons/fi';
import AnimatedText from '@/components/AnimatedText';
import AnimatedParagraph from '@/components/AnimatedParagraph';

const cards = [
  {
    title: "Grid-format",
    icon: FiGrid,
    description:
      "Velg antall rader og kolonner og la systemet regne ut en jevn fordeling. Rutenettet skalerer automatisk til skjermens størrelse.",
  },
  {
    title: "Koble celler",
    icon: FiMaximize2,
    description:
      "Koble sammen naboceller til større paneler. Bruk dette til brede bannere, store medieflater eller kombinerte informasjonsfelt.",
  },
  {
    title: "Layout-bibliotek",
    icon: FiLayers,
    description:
      "Lagre og gjenbruk oppsett. Start fra ferdige maler eller bygg helt frie oppsett hvor celler strekkes, flyttes og kopieres.",
  },
  {
    title: "Farger og tema",
    icon: FiDroplet,
    description:
      "Gi hver celle eller panel egen bakgrunnsfarge, transparens og tema. Systemet støtter både lys og mørk modus automatisk.",
  },
];

const ForskjelligeOppsett = () => {
  return (
    <div className="relative flex items-center justify-center h-screen px-4 py-16">
      <div className="relative z-10 w-full max-w-7xl text-custom-color-900 dark:text-white">
        <div className="max-w-3xl mb-12 px-4 md:px-0">
          <h1 className="mb-6">
            <AnimatedText
              text="Fleksible skjermoppsett"
              size="text-3xl md:text-4xl lg:text-6xl"
              primaryFont="font-serif"
              fontWeight="font-medium"
              order={0}
              className="mb-4"
            />
          </h1>
          <AnimatedParagraph
            order={1}
            className="text-base md:text-lg lg:text-lg"
          >
            Design inch-perfect canvases med vårt fleksible grid-system. Dra og
            slipp komponenter på rutenettet, koble celler sammen til større paneler,
            og lagre oppsett som kan gjenbrukes på tvers av skjermer.
          </AnimatedParagraph>
        </div>

        <div className="grid md:grid-cols-4 gap-8 w-full px-4 md:px-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              className="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/80 p-6 text-custom-color-900 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-custom-color-800/70 dark:text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-custom-color-100/40 via-transparent to-custom-color-300/35 opacity-0 transition group-hover:opacity-100 dark:from-custom-color-700/25 dark:to-custom-color-500/35" />
              <div className="flex flex-col h-full text-left">
                <motion.h2
                  className="text-2xl font-semibold mb-3 font-sans text-custom-color-900 dark:text-white"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: index * 0.1 + 0.05, duration: 0.3 }}
                >
                  {card.title}
                </motion.h2>
                <motion.p
                  className="text-sm text-custom-color-700/80 dark:text-white/75"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: index * 0.1 + 0.1, duration: 0.3 }}
                >
                  {card.description}
                </motion.p>

                <div className="flex-grow" />

                <motion.div
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-custom-color-500/15 p-4 text-custom-color-600 dark:bg-custom-color-400/20 dark:text-custom-color-200"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: index * 0.1 + 0.15, duration: 0.3 }}
                >
                  <card.icon className="w-12 h-12" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForskjelligeOppsett;
