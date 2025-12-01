"use client";
import Button from '@/components/Button'
import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import AnimatedText from '@/components/AnimatedText'
import AnimatedParagraph from '@/components/AnimatedParagraph'
import AnimatedImage from '@/components/AnimatedImage'

const StotteLanding = () => {
  return (
    <div className="flex items-center justify-center h-screen px-4">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl items-center gap-12">
        {/* Text Section */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <h1 className="mb-8">
            <AnimatedText 
              text="Støtte"
              size="text-4xl md:text-5xl lg:text-7xl"
              primaryFont="font-serif"
              fontWeight="font-medium"
              order={0}
            />
          </h1>
          <h2 className="mb-8">
            <AnimatedText 
              text="Her er noen av våre vanligste spørsmål!"
              size="text-xl md:text-2xl lg:text-3xl"
              order={1}
            />
          </h2>
        </div>

        {/* Image Section */}
        <div className="w-full lg:w-1/2 flex justify-center relative">
          <div className="relative max-w-[50vw] lg:max-w-none">
            {/* Background image */}
            <div className="absolute -right-6 z-0 w-2/3 lg:w-4/5 opacity-45">
              <AnimatedImage order={1}>
                <Image
                  src="/images/fullscreen_grid_layout.svg"
                  alt="Background image"
                  width={300}
                  height={300}
                  priority
                  className="absolute -right-6 z-0 w-2/3 lg:w-4/5 opacity-45"
                />
              </AnimatedImage>
            </div>

            {/* Foreground image */}
            <div>
              <AnimatedImage order={2} className="relative z-10 max-h-[40vh] w-auto">
                <Image
                  src="/images/peacock_pose_thumbs_up.png"
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
  )
}

export default StotteLanding
