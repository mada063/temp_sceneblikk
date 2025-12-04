"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, ReactNode } from "react";

interface AnimatedTextProps {
  text: string;
  secondaryText?: string;
  order?: number;
  size?: string;
  color?: string;
  secondaryColor?: string;
  primaryFont?: string;
  secondaryFont?: string;
  fontWeight?: string;
  className?: string;
}

const AnimatedText = ({
  text,
  secondaryText = "",
  order = 0,
  size = "text-3xl",
  color = "text-custom-color-900 dark:text-white",
  secondaryColor = "text-gray-500",
  primaryFont = "font-sans",
  secondaryFont = "font-serif",
  fontWeight = "",
  className = "",
}: AnimatedTextProps) => {
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
    <div
      ref={ref}
      className={`${size} ${color} ${fontWeight} ${primaryFont} pb-[8px] relative ${className}`}
    >
      <motion.span
        initial={{ y: 50, opacity: 0 }}
        animate={shouldAnimate ? { y: 0, opacity: 1 } : undefined}
        whileInView={!shouldAnimate ? { y: 0, opacity: 1 } : undefined}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ delay: order * 0.1, duration: 0.6, ease: "easeOut" as const }}
        className={`inline-block ${color}`}
      >
        {text}
      </motion.span>

      {secondaryText && (
        <motion.span
          initial={{ y: 50, opacity: 0 }}
          animate={shouldAnimate ? { y: 0, opacity: 1 } : undefined}
          whileInView={!shouldAnimate ? { y: 0, opacity: 1 } : undefined}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: order * 0.1, duration: 0.6, ease: "easeOut" as const }}
          className={`inline-block ${secondaryFont} ${secondaryColor} ml-2 pb-[8px]`}
        >
          {secondaryText}
        </motion.span>
      )}
    </div>
  );
};

export default AnimatedText;

