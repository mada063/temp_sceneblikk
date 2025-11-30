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
      icon: <FaUserPlus className="w-12 h-12 text-custom-600" />,
    },
    {
      title: "Lag byggeblokker",
      description: "Lag dine egne byggeblokker med innhold som bilder, tekst og værmeldinger.",
      icon: <FaCubes className="w-12 h-12 text-custom-600" />,
    },
    {
      title: "Design oppsett",
      description: "Design ditt oppsett ved å plassere byggeblokker i rutenett eller fullskjerm.",
      icon: <FaPalette className="w-12 h-12 text-custom-600" />,
    },
    {
      title: "Registrer skjerm",
      description: "Registrer dine Android enheter i systemet.",
      icon: <FaTv className="w-12 h-12 text-custom-600" />,
    },
    {
      title: "Tildel oppsett",
      description: "Tildel ditt oppsett til skjermen og se endringene i sanntid.",
      icon: <FaLink className="w-12 h-12 text-custom-600" />,
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
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8 w-full px-8">
        {steps.map((step, index) => (
            <motion.div
                key={index}
                className="bg-white p-8 rounded-lg flex flex-col text-center h-full"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
            >
                <motion.h2 
                  className="text-2xl font-semibold mb-4 font-serif"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: index * 0.1 + 0.1, duration: 0.4 }}
                >
                  {step.title}
                </motion.h2>
                <motion.p 
                  className="text-md text-gray-700 text-left"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                >
                  {step.description}
                </motion.p>

                {/* Spacer to push icon to bottom consistently */}
                <div className="flex-grow" />

                {/* Icon container */}
                <motion.div 
                  className="bg-custom-200 p-4 rounded-lg mt-8 self-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
                >
                  {step.icon}
                </motion.div>
            </motion.div>
            ))}

        </div>
      </div>
    </div>
  );
};

export default KomIGangSteps;
