"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaUsers, FaHandSparkles } from "react-icons/fa";
import { MdLiveTv } from "react-icons/md";
import AnimatedImage from "@/components/AnimatedImage";
import { useI18n } from "@/app/i18n";

const Bulletpoints = () => {
  const { locale } = useI18n();

  const features = [
    {
      title: locale === "nb" ? "Freeform grid-system" : "Freeform grid system",
      description:
        locale === "nb"
          ? "Plasser komponenter fritt på rutenettet, juster størrelsen på celler og bygg oppsett som passer perfekt til skjermen."
          : "Place components freely on the grid, adjust cell sizes and build layouts that fit each screen perfectly.",
      icon: (
        <FaUsers className="w-24 h-24 text-custom-color-600 dark:text-custom-color-400" />
      ),
    },
    {
      title: locale === "nb" ? "Live oppdatering" : "Live updates",
      description:
        locale === "nb"
          ? "Endringer i editoren oppdateres øyeblikkelig på alle aktive skjermer – alltid synkronisert."
          : "Changes in the editor are reflected instantly on every active screen – always in sync.",
      icon: (
        <MdLiveTv className="w-24 h-24 text-custom-color-600 dark:text-custom-color-400" />
      ),
    },
    {
      title: locale === "nb" ? "Mange komponenter" : "Many components",
      description:
        locale === "nb"
          ? "Velg mellom komponenter som vær, nyheter, klokker, bilder, video, transport og mer – alle med egne innstillinger."
          : "Choose between components like weather, news, clocks, images, video, transport and more – each with its own settings.",
      icon: (
        <FaHandSparkles className="w-24 h-24 text-custom-color-600 dark:text-custom-color-400" />
      ),
    },
  ];

  return (
    <div className="relative flex items-center justify-center h-screen px-4 py-16">
      {/* Background Image */}
      {/* Centered background image behind middle card */}
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
        <div className="grid md:grid-cols-3 gap-8 w-full px-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
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
                  {feature.title}
                </motion.h2>
                <motion.p
                  className="text-sm text-custom-color-700/80 dark:text-white/75"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: index * 0.1 + 0.1, duration: 0.3 }}
                >
                  {feature.description}
                </motion.p>

                <div className="flex-grow" />

                <motion.div
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-custom-color-500/15 p-4 text-custom-color-600 dark:bg-custom-color-400/20 dark:text-custom-color-200"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: index * 0.1 + 0.15, duration: 0.3 }}
                >
                  {feature.icon}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bulletpoints;
