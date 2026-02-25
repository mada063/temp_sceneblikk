'use client';

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FiChevronDown } from "react-icons/fi";
import { useI18n } from "../lib/i18n";

const LOCALES = [
  {
    code: "nb",
    label: "Norsk",
    // Adjust the flag path if your asset is named differently
    flagSrc: "/images/norway.png",
  },
  {
    code: "en",
    label: "English",
    // Adjust the flag path if your asset is named differently
    flagSrc: "/images/uk.png",
  },
] as const;

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ChevronIcon = FiChevronDown as React.ComponentType<{
    className?: string;
    "aria-hidden"?: boolean;
  }>;

  const current = LOCALES.find((item) => item.code === locale) ?? LOCALES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: (typeof LOCALES)[number]["code"]) => {
    setLocale(code);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-custom-color-700 transition hover:border-white/60 hover:bg-white/20 dark:text-custom-color-100"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span className="relative h-4 w-6 overflow-hidden rounded-sm bg-white/40 dark:border-white/20">
            <Image
              src={current.flagSrc}
              alt={current.label}
              fill
              sizes="1.5rem"
              className="object-cover"
            />
          </span>
          <span>{current.code.toUpperCase()}</span>
        </span>
        <ChevronIcon
          className={`h-3 w-3 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-40 rounded-xl border border-white/30 bg-white/90 p-1 text-xs shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-custom-color-900/95">
          <div role="listbox" aria-label="Select language">
            {LOCALES.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelect(item.code)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition hover:bg-custom-color-100/80 dark:hover:bg-custom-color-700/60 ${
                  item.code === current.code
                    ? "bg-custom-color-100/90 font-semibold dark:bg-custom-color-800/80"
                    : ""
                }`}
                role="option"
                aria-selected={item.code === current.code}
              >
                <span className="relative h-4 w-6 overflow-hidden rounded-sm border border-custom-color-200/70 bg-white/80 dark:border-custom-color-600/70 dark:bg-custom-color-800/70">
                  <Image
                    src={item.flagSrc}
                    alt={item.label}
                    fill
                    sizes="1.5rem"
                    className="object-cover"
                  />
                </span>
                <span className="flex-1">{item.label}</span>
                <span className="text-[0.625rem] uppercase tracking-[0.16em] text-custom-color-500 dark:text-custom-color-200">
                  {item.code.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

