"use client";
import React from 'react'
import Button from '@/components/Button'
import { motion } from 'framer-motion'
import AnimatedText from '@/components/AnimatedText'
import AnimatedParagraph from '@/components/AnimatedParagraph'

const FlereSporsmal = () => {
  return (
    <div className='max-w-6xl mx-auto h-[25vh]'>
        <AnimatedText 
          text="Har du flere spørsmål?"
          size="text-xl md:text-3xl lg:text-4xl"
          primaryFont="font-serif"
          order={0}
          className="mb-8"
        />
        <AnimatedParagraph 
          order={3}
          className="text-base md:text-lg lg:text-lg mb-8"
        >
          Ikke vær redd for å ta kontakt!
        </AnimatedParagraph>
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Button href="/kontakt">Kontakt</Button>
        </motion.div>
    </div>
  )
}

export default FlereSporsmal
