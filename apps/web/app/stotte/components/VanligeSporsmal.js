'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/app/i18n';

const VanligeSporsmal = () => {
  const { locale } = useI18n();

  const faqs =
    locale === 'nb'
      ? [
          {
            question: 'Hvordan lager jeg en scene?',
            answer:
              'Du lager en ny scene ved å gå inn i redigeringsvinduet og trykke lagre. Da har du laget en ny scene og kan redigere som du vil.',
          },
          {
            question: 'Hvordan tildeler jeg scene til en skjerm?',
            answer:
              'Skjermen må ha nettleser. Gå inn på redigeringsvinduet og velg scene, trykk så på «se full skjerm».',
          },
          {
            question: 'Hvordan sjekker jeg oppetider?',
            answer: 'Gå inn på «Dashboard» og se oppetider for scenene dine.',
          },
          {
            question: 'Hvordan endrer jeg innholdet i en scene?',
            answer:
              'Gå inn på redigeringsvinduet og velg scene. Du kan nå endre scenen, og skjermen som presenterer vil oppdatere visningen.',
          },
        ]
      : [
          {
            question: 'How do I create a scene?',
            answer:
              'Create a new scene by opening the editor and clicking save. You now have a scene you can edit as you like.',
          },
          {
            question: 'How do I assign a scene to a screen?',
            answer:
              'The screen needs a browser. Open the editor, choose a scene and click “view fullscreen” on the device.',
          },
          {
            question: 'How do I check uptime?',
            answer:
              'Open the dashboard to see uptime and playback status for your scenes.',
          },
          {
            question: 'How do I change the content of a scene?',
            answer:
              'Open the editor and select a scene. Any changes you make will update on the screen that is presenting it.',
          },
        ];

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
        <h3 
          className="text-3xl font-serif text-custom-color-900 dark:text-white pb-[8px] relative"
        >
          {faq.question}
        </h3>
        <span 
          className="text-3xl text-custom-color-900 dark:text-white"
        >
          {isOpen ? '-' : '+'}
        </span>
      </div>
      <div className={`transition-all overflow-hidden duration-300 ease-in-out ${isOpen ? 'max-h-40 mt-2' : 'max-h-0'}`}>
        <div className={`${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
          <p 
            className="text-xl text-custom-color-700 dark:text-custom-color-100"
          >
            {faq.answer}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default VanligeSporsmal;
