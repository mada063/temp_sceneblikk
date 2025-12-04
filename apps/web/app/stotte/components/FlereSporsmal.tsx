"use client";
import React from 'react'
import Button from '@/components/Button'
import { motion } from 'framer-motion'
import AnimatedText from '@/components/AnimatedText'
import AnimatedParagraph from '@/components/AnimatedParagraph'
import { useI18n } from '@/app/i18n'

const FlereSporsmal = () => {
  const { locale } = useI18n();

  const heading =
    locale === 'nb' ? 'Har du flere spørsmål?' : 'Do you have more questions?';

  const body =
    locale === 'nb'
      ? 'Ikke vær redd for å ta kontakt!'
      : "Don't hesitate to reach out!";

  const cta = locale === 'nb' ? 'Kontakt' : 'Contact';

  return (
    <div className="flex items-center justify-center h-screen px-4">
      <div className='w-full max-w-6xl'>
        <AnimatedText 
          text={heading}
          size="text-xl md:text-3xl lg:text-4xl"
          primaryFont="font-serif"
          order={0}
          className="mb-8"
        />
        <AnimatedParagraph 
          order={3}
          className="text-base md:text-lg lg:text-lg mb-8"
        >
          {body}
        </AnimatedParagraph>
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Button href="/kontakt">{cta}</Button>
        </motion.div>
      </div>
    </div>
  )
}

export default FlereSporsmal

