'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const SUPPORTED_LOCALES = ['nb', 'en'];
const DEFAULT_LOCALE = 'nb';

const messages = {
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

const I18nContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (ns, key) => {
    const section = messages[DEFAULT_LOCALE][ns] || {};
    return section[key] || key;
  },
});

function getInitialLocale() {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const stored = window.localStorage.getItem('sceneblikk_locale');
  if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;

  const browser = window.navigator.language?.toLowerCase() || '';
  if (browser.startsWith('nb') || browser.startsWith('no')) return 'nb';

  if (browser.startsWith('en')) return 'en';

  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);

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

  const setLocale = (nextLocale) => {
    if (!SUPPORTED_LOCALES.includes(nextLocale)) return;
    setLocaleState(nextLocale);
  };

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (namespace, key) => {
        const ns = messages[locale]?.[namespace] || {};
        const fallbackNs = messages[DEFAULT_LOCALE]?.[namespace] || {};
        return ns[key] || fallbackNs[key] || key;
      },
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}


