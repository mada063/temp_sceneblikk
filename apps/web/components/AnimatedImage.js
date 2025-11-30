"use client";

import { motion } from "framer-motion";

const imageVariants = {
  hidden: { 
    y: 0, 
    opacity: 0,
    scale: 0.95
  },
  visible: (order) => ({
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { 
      delay: order * 0.1, 
      duration: 0.5, 
      ease: "easeOut" 
    },
  }),
};

const AnimatedImage = ({
  children,
  order = 0,
  className = "",
  ...props
}) => {
  return (
    <motion.div
      className={className}
      variants={imageVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      custom={order}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedImage;
