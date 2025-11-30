"use client";

import { motion } from "framer-motion";

const paragraphVariants = {
  hidden: { opacity: 0, y: 0 },
  visible: (order) => ({
    opacity: 1,
    y: 0,
    transition: { delay: order * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const AnimatedParagraph = ({
  children,
  order = 0,
  className = "",
  ...props
}) => {
  const defaultClasses = "text-custom-color-800 dark:text-custom-color-100";
  return (
    <motion.p
      className={`${defaultClasses} ${className}`}
      variants={paragraphVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      custom={order}
      {...props}
    >
      {children}
    </motion.p>
  );
};

export default AnimatedParagraph;
