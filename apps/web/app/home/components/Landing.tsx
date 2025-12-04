"use client";
import Button from '@/components/Button';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import AnimatedText from '@/components/AnimatedText';
import AnimatedParagraph from '@/components/AnimatedParagraph';
import AnimatedImage from '@/components/AnimatedImage';
import { useI18n } from '@/app/i18n';

const Landing = () => {
  const { locale } = useI18n();

  const tagline =
    locale === 'nb'
      ? 'En enkel løsning for moderne digital signage, helt gratis!'
      : 'A simple solution for modern digital signage, completely free!';

  const bodyText =
    locale === 'nb'
      ? 'Vi tilbyr forskjellige standard oppsett. Disse kan tilpasses etter dine behov.'
      : 'We offer a set of standard layouts that you can easily adapt to your own needs.';

  const ctaLabel = locale === 'nb' ? 'Kom i gang' : 'Get started';

  return (
    <div className="flex items-center justify-center h-screen px-4">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl items-center gap-12">
        {/* Text Section */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <h1 className="mb-8">
            <AnimatedText
              text="Sceneblikk"
              size="text-5xl md:text-6xl lg:text-8xl"
              primaryFont="font-serif"
              fontWeight="font-medium"
              order={0}
              className="mb-8"
            />
          </h1>
          <h2 className="mb-8">
            <AnimatedText
              text={tagline}
              size="text-xl md:text-2xl lg:text-3xl"
              order={1}
              className="mb-8"
            />
          </h2>
          <AnimatedParagraph
            order={3}
            className="text-base md:text-lg lg:text-lg mb-8"
          >
            {bodyText}
          </AnimatedParagraph>
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Button href="/kom-i-gang">{ctaLabel}</Button>
          </motion.div>
        </div>

        {/* Image Section */}
        <div className="w-full lg:w-1/2 flex justify-center relative">
          <div className="relative max-w-[50vw] lg:max-w-none">
            {/* Background image */}
            <div className="absolute -right-6 z-0 w-2/3 lg:w-4/5 opacity-45">
              <AnimatedImage order={1}>
                <Image
                  src="/images/4-delt.svg"
                  alt="Background image"
                  width={300}
                  height={300}
                  priority
                />
              </AnimatedImage>
            </div>
            {/* Foreground image */}
            <div>
              <AnimatedImage order={2}>
                <Image
                  src="/images/peacock_embedded_1.png"
                  alt="Landing Image"
                  width={800}
                  height={800}
                  priority
                  className="relative z-10 max-h-[40vh] w-auto"
                />
              </AnimatedImage>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

