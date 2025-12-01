"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaUserPlus, FaCubes, FaPalette, FaTv, FaLink } from "react-icons/fa";
import AnimatedImage from "@/components/AnimatedImage";

const KomIGangSteps = () => {
  const steps = [
    {
      title: "Registrer deg",
      description: "Opprett en konto på Sceneblikk for å komme i gang med digital skilting.",
      icon: <FaUserPlus className="w-12 h-12 text-custom-color-600 dark:text-custom-color-200" />,
    },
    {
      title: "Lag scene",
      description: "Lag dine egne scener med innhold som bilder, tekst og værmeldinger.",
      icon: <FaCubes className="w-12 h-12 text-custom-color-600 dark:text-custom-color-200" />,
    },
    {
      title: "Presenter scene",
      description: "Presenter scene på skjermene dine.",
      icon: <FaPalette className="w-12 h-12 text-custom-color-600 dark:text-custom-color-200" />,
    },
    {
      title: "Sjekk oppetider",
      description: "Sjekk oppetider for sceneene dine.",
      icon: <FaTv className="w-12 h-12 text-custom-color-600 dark:text-custom-color-200" />,
    },
    {
      title: "Endre innhold",
      description: "Endre innholdet i sceneene dine og se endringene i sanntid.",
      icon: <FaLink className="w-12 h-12 text-custom-color-600 dark:text-custom-color-200" />,
    },
  ];
  
  return (
    <div className="relative flex items-center justify-center h-screen px-4 py-16">
        <AnimatedImage 
          order={0}
          className="absolute z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <Image
              src="/images/peacock_embedded_2.png"
              alt="Landing Background"
              width={500}
              height={500}
              className="max-w-[500px] w-full h-auto mb-64"
              priority
          />
        </AnimatedImage>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl pt-44">
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8 w-full px-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
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
                  {step.title}
                </motion.h2>
                <motion.p
                  className="text-sm text-custom-color-700/80 dark:text-custom-color-100/75"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: index * 0.1 + 0.1, duration: 0.3 }}
                >
                  {step.description}
                </motion.p>

                <div className="flex-grow" />

                <motion.div
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-custom-color-500/15 p-4 text-custom-color-600 dark:bg-custom-color-400/20 dark:text-custom-color-200"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: index * 0.1 + 0.15, duration: 0.3 }}
                >
                  {step.icon}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KomIGangSteps;
