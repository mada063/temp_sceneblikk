"use client";
import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import AnimatedText from '@/components/AnimatedText'
import AnimatedParagraph from '@/components/AnimatedParagraph'
import AnimatedImage from '@/components/AnimatedImage'

const ForskjelligeOppsett = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      <div className="w-full max-w-6xl">
        <h1 className='mb-8'>
        <AnimatedText 
          text="Forskjellige oppsett"
          size="text-3xl md:text-4xl lg:text-6xl"
          primaryFont="font-serif"
          fontWeight="font-medium"
          order={0}
          className="mb-8"
        />
        </h1>
        <AnimatedParagraph 
          order={1}
          className="text-base md:text-lg lg:text-lg mb-12"
        >
          Vi tilbyr forskjellige standard oppsett. Disse kan tilpasses etter dine behov.
        </AnimatedParagraph>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          <motion.div 
            className="flex flex-col items-center text-center bg-white p-8 rounded-lg h-full overflow-hidden"
            initial={{ opacity: 0, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <AnimatedImage order={1} className="w-full flex items-center justify-center mb-2">
              <Image 
                src="/images/fullscreen_grid_layout.svg" 
                alt="Fullskjerm" 
                width={200}
                height={200}
                className="max-w-full h-auto object-contain"
              />
            </AnimatedImage>
            <p className='text-xl'>
              Fullskjerm
            </p>
          </motion.div>                
          <motion.div 
            className="flex flex-col items-center text-center bg-white p-8 rounded-lg h-full overflow-hidden"
            initial={{ opacity: 0, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <AnimatedImage order={2} className="w-full flex items-center justify-center mb-2">
              <Image 
                src="/images/mixed_grid_layout.svg" 
                alt="Banner" 
                width={200}
                height={200}
                className="max-w-full h-auto object-contain"
              />
            </AnimatedImage>
            <p className='text-xl'>
              Banner
            </p>
          </motion.div>
          <motion.div 
            className="flex flex-col items-center text-center bg-white p-8 rounded-lg h-full overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <AnimatedImage order={3} className="w-full flex items-center justify-center mb-2">
              <Image 
                src="/images/compact_grid_layout.svg" 
                alt="Rutenett" 
                width={200}
                height={200}
                className="max-w-full h-auto object-contain"
              />
            </AnimatedImage>                    
            <p className='text-xl'>
              Rutenett
            </p>
          </motion.div>
          <motion.div 
            className="flex flex-col items-center text-center bg-white p-8 rounded-lg h-full overflow-hidden"
            initial={{ opacity: 0, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <AnimatedImage order={4} className="w-full flex items-center justify-center mb-2">
              <Image 
                src="/images/2-kolonner.svg" 
                alt="2 kolonner" 
                width={200}
                height={200}
                className="max-w-full h-auto object-contain"
              />
            </AnimatedImage>
            <p className='text-xl'>
              2 kolonner
            </p>
          </motion.div>
          <motion.div 
            className="flex flex-col items-center text-center bg-white p-8 rounded-lg h-full overflow-hidden"
            initial={{ opacity: 0, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <AnimatedImage order={5} className="w-full flex items-center justify-center mb-2">
              <Image 
                src="/images/2-kolonner-stablet.svg" 
                alt="2 rekker" 
                width={200}
                height={200}
                className="max-w-full h-auto object-contain"
              />
            </AnimatedImage>
            <p className='text-xl'>
              2 rekker
            </p>
          </motion.div>
          <motion.div 
            className="flex flex-col items-center text-center bg-white p-8 rounded-lg h-full overflow-hidden"
            initial={{ opacity: 0, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <AnimatedImage order={6} className="w-full flex items-center justify-center mb-2">
              <Image 
                src="/images/3-delt.svg" 
                alt="3 delt" 
                width={200}
                height={200}
                className="max-w-full h-auto object-contain"
              />
            </AnimatedImage>
            <p className='text-xl'>
              3 delt
            </p>
          </motion.div>
          <motion.div 
            className="flex flex-col items-center text-center bg-white p-8 rounded-lg h-full overflow-hidden"
            initial={{ opacity: 0, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <AnimatedImage order={7} className="w-full flex items-center justify-center mb-2">
              <Image 
                src="/images/4-delt.svg" 
                alt="4 delt" 
                width={200}
                height={200}
                className="max-w-full h-auto object-contain"
              />
            </AnimatedImage>
            <p className='text-xl'>
              4 delt
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ForskjelligeOppsett
