"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, ReactNode } from "react";

const paragraphVariants = {
  hidden: { opacity: 0, y: 0 },
  visible: (order: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: order * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

interface AnimatedParagraphProps {
  children: ReactNode;
  order?: number;
  className?: string;
  [key: string]: unknown;
}

const AnimatedParagraph = ({
  children,
  order = 0,
  className = "",
  ...props
}: AnimatedParagraphProps) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const defaultClasses = "text-custom-color-800 dark:text-custom-color-100";

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
    <motion.p
      ref={ref}
      className={`${defaultClasses} ${className}`}
      variants={paragraphVariants}
      initial="hidden"
      animate={shouldAnimate ? "visible" : undefined}
      whileInView={!shouldAnimate ? "visible" : undefined}
      viewport={{ once: true, amount: 0.3 }}
      custom={order}
      {...props}
    >
      {children}
    </motion.p>
  );
};

export default AnimatedParagraph;

