'use client';

import { FiGlobe } from "react-icons/fi";
import { useI18n } from "../lib/i18n";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  const toggleLocale = () => {
    setLocale(locale === "nb" ? "en" : "nb");
  };

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-custom-color-700 transition hover:border-white/60 hover:bg-white/20 dark:text-custom-color-100"
      aria-label={locale === "nb" ? "Switch to English" : "Bytt til norsk"}
    >
      <FiGlobe className="h-4 w-4" />
      <span>{locale === "nb" ? "NO" : "EN"}</span>
    </button>
  );
}


