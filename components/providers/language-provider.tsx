"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { LANG_STORAGE_KEY } from "@/lib/constants";
import { translate } from "@/lib/messages";
import type { Language } from "@/lib/types";

type LanguageContextValue = {
  language: Language;
  isHydrated: boolean;
  setLanguage: (language: Language) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const storedLanguage = window.localStorage.getItem(LANG_STORAGE_KEY);

    return storedLanguage === "es" ? "es" : "en";
  });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(LANG_STORAGE_KEY);

    if (storedLanguage === "en" || storedLanguage === "es") {
      setLanguageState(storedLanguage);
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(LANG_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [isHydrated, language]);

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage);
  }

  function t(key: string, values?: Record<string, string | number>) {
    return translate(language, key, values);
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        isHydrated,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider.");
  }

  return context;
}
