'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedText from '@/components/AnimatedText';

const faqs = [
  {
    question: 'Hordan lager jeg et oppsett?',
    answer: 'Du lager et nytt oppsett ved å gå inn i "Oppsett" menyen og trykker på "Nytt oppsett".',
  },
  {
    question: 'Hvordan lager jeg et nytt byggesett?',
    answer: 'Du lager et nytt byggesett ved å gå inn i "Oppsett" menyen og trykker på "Nytt byggesett".',
  },
  {
    question: 'Hvordan tildeler jeg oppsett til en skjerm?',
    answer: 'Først må du registrere en skjerm. Etter det kan du gå inn i "Dashboard" og trykke på det store "+" tegnet for å tildele oppsett til en skjerm.',
  },
  {
    question: 'Hvordan legger jeg til en skjerm?',
    answer: 'Installer appen på en Android TV eller Android TV Box. Deretter kan du registrere skjermen i "Skjerm" menyen.',
  },
];

const VanligeSporsmal = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-6xl mx-auto h-fit mb-52">
      <div className="space-y-10">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            faq={faq}
            isOpen={openIndex === index}
            onClick={() => toggleFAQ(index)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

const FAQItem = ({ faq, isOpen, onClick, index }) => {
  return (
    <motion.div 
      className="border-b border-custom-color-400/60 pb-4 dark:border-custom-color-500/70"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <div
        className="flex justify-between cursor-pointer"
        onClick={onClick}
      >
        <AnimatedText 
          text={faq.question}
          size="text-3xl"
          primaryFont="font-serif"
          order={0}
        />
        <motion.span 
          className="text-3xl"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: index * 0.1 + 0.1, duration: 0.4 }}
        >
          {isOpen ? '-' : '+'}
        </motion.span>
      </div>
      <div className={`transition-all overflow-hidden duration-300 ease-in-out ${isOpen ? 'max-h-40 mt-2' : 'max-h-0'}`}>
        <div className={`${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
          <motion.p 
            className="text-xl text-custom-color-700/80 dark:text-custom-color-100/80"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
          >
            {faq.answer}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default VanligeSporsmal;
