import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 'en' | 'ur';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  phoneticInputEnabled: boolean;
  setPhoneticInputEnabled: (enabled: boolean) => void;
  isUrdu: boolean;
  toggleLanguage: () => void;
}

const LANGUAGE_STORAGE_KEY = 'az_typing_language_v1';
const PHONETIC_STORAGE_KEY = 'az_typing_phonetic_v1';

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  phoneticInputEnabled: true,
  setPhoneticInputEnabled: () => {},
  isUrdu: false,
  toggleLanguage: () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage;
      if (saved === 'en' || saved === 'ur') return saved;
    }
    return 'en';
  });

  const [phoneticInputEnabled, setPhoneticInputEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PHONETIC_STORAGE_KEY);
      if (saved !== null) return saved === 'true';
    }
    return true; // Default to true so typing Urdu on English keyboards works automatically out of the box!
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
  };

  const setPhoneticInputEnabled = (enabled: boolean) => {
    setPhoneticInputEnabledState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem(PHONETIC_STORAGE_KEY, String(enabled));
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        phoneticInputEnabled,
        setPhoneticInputEnabled,
        isUrdu: language === 'ur',
        toggleLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
