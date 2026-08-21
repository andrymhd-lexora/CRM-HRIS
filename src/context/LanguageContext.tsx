import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, TranslationsDict } from '../utils/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: TranslationsDict;
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatMoney: (amount: number, currencyCode?: string) => string;
  formatCurrency: (amount: number, currencyCode?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'crm_hris_app_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize language from localStorage or default to Indonesian ('id')
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'id' || saved === 'en') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'id';
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch (e) {
      console.warn('Failed to save language preference:', e);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  // Sync HTML lang attribute and document title dynamically
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = translations[language];

  // Helper date formatter honoring current language locale
  const formatDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return String(date);
      const locale = language === 'id' ? 'id-ID' : 'en-US';
      const defaultOptions: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      };
      return d.toLocaleDateString(locale, options || defaultOptions);
    } catch {
      return String(date);
    }
  };

  // Helper currency formatter
  const formatMoney = (amount: number, currencyCode: string = 'IDR'): string => {
    const num = Number(amount) || 0;
    const locale = language === 'id' ? 'id-ID' : 'en-US';
    return `${currencyCode} ${num.toLocaleString(locale)}`;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        formatDate,
        formatMoney,
        formatCurrency: formatMoney
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
