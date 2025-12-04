"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, ReactNode } from "react";

const imageVariants = {
  hidden: { 
    y: 0, 
    opacity: 0,
    scale: 0.95
  },
  visible: (order: number) => ({
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { 
      delay: order * 0.1, 
      duration: 0.5, 
      ease: "easeOut" as const
    },
  }),
};

interface AnimatedImageProps {
  children: ReactNode;
  order?: number;
  className?: string;
  [key: string]: unknown;
}

const AnimatedImage = ({
  children,
  order = 0,
  className = "",
  ...props
}: AnimatedImageProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const checkInView = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        if (isInView) {
          setShouldAnimate(true);
        }
      }
    };

    // Check immediately on mount
    checkInView();
    // Also check after a short delay to ensure layout is complete
    const timeout = setTimeout(checkInView, 100);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={imageVariants}
      initial="hidden"
      animate={shouldAnimate ? "visible" : undefined}
      whileInView={!shouldAnimate ? "visible" : undefined}
      viewport={{ once: true, amount: 0.3 }}
      custom={order}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedImage;

