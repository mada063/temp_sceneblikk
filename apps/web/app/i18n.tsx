'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const SUPPORTED_LOCALES = ['nb', 'en'] as const;
const DEFAULT_LOCALE = 'nb';

type Locale = typeof SUPPORTED_LOCALES[number];

type Messages = {
  [key in Locale]: {
    [namespace: string]: {
      [key: string]: string;
    };
  };
};

const messages: Messages = {
  nb: {
    header: {
      support: 'Støtte',
      login: 'Logg inn',
    },
  },
  en: {
    header: {
      support: 'Support',
      login: 'Log in',
    },
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (namespace: string, key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (ns, key) => {
    const section = messages[DEFAULT_LOCALE][ns] || {};
    return section[key] || key;
  },
});

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const stored = window.localStorage.getItem('sceneblikk_locale');
  if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) return stored as Locale;

  const browser = window.navigator.language?.toLowerCase() || '';
  if (browser.startsWith('nb') || browser.startsWith('no')) return 'nb';

  if (browser.startsWith('en')) return 'en';

  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Use a stable default locale for server + first client render to avoid
  // hydration mismatches, then apply stored / browser locale on mount.
  useEffect(() => {
    const initial = getInitialLocale();
    setLocaleState(initial);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('sceneblikk_locale', locale);
    }
  }, [locale]);

  const setLocale = (nextLocale: Locale) => {
    if (!SUPPORTED_LOCALES.includes(nextLocale)) return;
    setLocaleState(nextLocale);
  };

  const value = useMemo<I18nContextType>(
    () => ({
      locale,
      setLocale,
      t: (namespace: string, key: string) => {
        const ns = messages[locale]?.[namespace] || {};
        const fallbackNs = messages[DEFAULT_LOCALE]?.[namespace] || {};
        return ns[key] || fallbackNs[key] || key;
      },
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children as any}</I18nContext.Provider>;
}

export function useI18n(): I18nContextType {
  return useContext(I18nContext);
}




