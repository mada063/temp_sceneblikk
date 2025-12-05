"use client";
import Button from '@/components/Button'
import React from 'react'
import NextImage from 'next/image'
import { motion } from 'framer-motion'

// Type-safe wrapper for Next.js Image component
const Image = NextImage as any;
import AnimatedText from '@/components/AnimatedText'
import AnimatedParagraph from '@/components/AnimatedParagraph'
import { useI18n } from '@/app/i18n'

const KontaktLanding = () => {
  const { locale } = useI18n();

  const title = locale === 'nb' ? 'Kontakt oss' : 'Contact us';
  const subtitle =
    locale === 'nb'
      ? 'Har du noen spørsmål, ønsker eller vil melde en feil i systemet, kan du kontakte oss på:'
      : 'If you have questions, feature requests or want to report an issue, you can reach us at:';

  return (
    <div className="flex items-center justify-center h-screen px-4">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl items-center gap-12">
        {/* Text Section */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <h1 className="mb-8">
            <AnimatedText 
              text={title}
              size="text-4xl md:text-5xl lg:text-7xl"
              primaryFont="font-serif"
              fontWeight="font-medium"
              order={0}
            />
          </h1>
          <h2 className="mb-8">
            <AnimatedText 
              text={subtitle}
              size="text-xl md:text-2xl lg:text-3xl"
              order={1}
            />
          </h2>
          <motion.p 
            className="text-base md:text-lg lg:text-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            mathias@dallastek.no
          </motion.p>
        </div>

        {/* Image Section */}
        <div className="w-full lg:w-1/2 flex justify-center relative">
          <div className="relative max-w-[50vw] lg:max-w-none">
            {/* Background image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="absolute -right-6 z-0 w-2/3 lg:w-4/5 opacity-45"
            >
              <Image
                src="/images/mixed_grid_layout.svg"
                alt="Background image"
                width={300}
                height={300}
                priority
                className="absolute -right-6 z-0 w-2/3 lg:w-4/5 opacity-45"
              />
            </motion.div>

            {/* Foreground image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative z-10 max-h-[40vh] w-auto"
            >
              <Image
                src="/images/peacock_tail_display.png"
                alt="Landing Image"
                width={800}
                height={800}
                priority
                className="relative z-10 max-h-[40vh] w-auto"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KontaktLanding



