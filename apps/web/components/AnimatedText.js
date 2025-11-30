"use client";

import { motion } from "framer-motion";

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
}) => {
  return (
    <div
      className={`${size} ${color} ${fontWeight} ${primaryFont} pb-[8px] relative ${className}`}
    >
      <motion.span
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ delay: order * 0.1, duration: 0.6, ease: "easeOut" }}
        className={`inline-block ${color}`}
      >
        {text}
      </motion.span>

      {secondaryText && (
        <motion.span
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: order * 0.1, duration: 0.6, ease: "easeOut" }}
          className={`inline-block ${secondaryFont} ${secondaryColor} ml-2 pb-[8px]`}
        >
          {secondaryText}
        </motion.span>
      )}
    </div>
  );
};

export default AnimatedText;
