"use client";
import Button from '@/components/Button'
import React from 'react'
import NextImage from 'next/image'
import Link from 'next/link'

// Type-safe wrapper for Next.js Image component
const Image = NextImage as any;
import Button2 from '@/components/Button2'
import { motion } from 'framer-motion'
import AnimatedText from '@/components/AnimatedText'
import AnimatedParagraph from '@/components/AnimatedParagraph'
import AnimatedImage from '@/components/AnimatedImage'
import { useI18n } from '@/app/i18n'

const Starte = () => {
  const { locale } = useI18n();

  const heading =
    locale === 'nb' ? 'Hvordan komme i gang?' : 'How to get started?';

  const line1 =
    locale === 'nb'
      ? 'Sceneblikk er gratis og kjøres i nettleser. Du trenger kun en skjerm og en PC for å komme i gang.'
      : 'Sceneblikk is free and runs in the browser. You only need a screen and a computer to get started.';

  const line2 =
    locale === 'nb'
      ? 'Dersom du har spørsmål, vil komme med ønsker eller melde en feil er det bare til å kontakte oss.'
      : 'If you have questions, feature requests or want to report an issue, just get in touch with us.';

  const getStarted = locale === 'nb' ? 'Kom i gang' : 'Get started';
  const contactUs = locale === 'nb' ? 'Kontakt oss' : 'Contact us';

  return (
    <div className="flex items-center justify-center h-screen px-4">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl items-center gap-12">
        {/* Text Section */}
        <div className="w-full lg:w-1/2 text-center lg:text-left text-custom-color-900 dark:text-white">
          <h1 className='mb-8'>
          <AnimatedText 
            text={heading}
            size="text-3xl md:text-4xl lg:text-6xl"
            primaryFont="font-serif"
            fontWeight="font-medium"
            order={0}
            className="mb-6"
          />
          </h1>
          <AnimatedParagraph 
            order={1}
            className="text-base md:text-lg lg:text-lg mb-8"
          >
            {line1}
          </AnimatedParagraph>
          <AnimatedParagraph 
            order={2}
            className="text-base md:text-lg lg:text-lg mb-8"
          >
            {line2}
          </AnimatedParagraph>
          <motion.div 
            className="flex flex-col md:flex-row gap-4 justify-center lg:justify-start"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Button href="/kom-i-gang">{getStarted}</Button>
            <Button2 href="/kontakt">{contactUs}</Button2>
          </motion.div>
        </div>

        {/* Image Section */}
        <div className="w-full lg:w-1/2 flex justify-center relative">
          <div className="relative max-w-[50vw] lg:max-w-none">

            {/* Foreground image */}
            <AnimatedImage order={1} className="relative z-10 max-h-[40vh] w-auto">
              <Image
                src="/images/peacock_pose_thumbs_up.png"
                alt="Landing Image"
                width={800}
                height={800}
                className='relative z-10 max-h-[40vh] w-auto'
              />
            </AnimatedImage>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Starte

