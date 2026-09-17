import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { t as translateFn } from '../i18n';

interface AccessibilityContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyOrPhrase: string, fallback?: string) => string;
  textSize: 'sm' | 'md' | 'lg' | 'xl';
  setTextSize: (size: 'sm' | 'md' | 'lg' | 'xl') => void;
  increaseTextSize: () => void;
  decreaseTextSize: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('sevaai_lang') as Language) || 'en';
  });

  const [textSize, setTextSizeState] = useState<'sm' | 'md' | 'lg' | 'xl'>(() => {
    return (localStorage.getItem('sevaai_text_size') as any) || 'md';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('sevaai_high_contrast') === 'true';
  });

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return localStorage.getItem('sevaai_reduced_motion') === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-size-sm', 'text-size-md', 'text-size-lg', 'text-size-xl');
    root.classList.add(`text-size-${textSize}`);
    localStorage.setItem('sevaai_text_size', textSize);
  }, [textSize]);

  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('sevaai_high_contrast', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    const root = document.documentElement;
    if (reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    localStorage.setItem('sevaai_reduced_motion', String(reducedMotion));
  }, [reducedMotion]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sevaai_lang', lang);
  };

  const increaseTextSize = () => {
    if (textSize === 'sm') setTextSizeState('md');
    else if (textSize === 'md') setTextSizeState('lg');
    else if (textSize === 'lg') setTextSizeState('xl');
  };

  const decreaseTextSize = () => {
    if (textSize === 'xl') setTextSizeState('lg');
    else if (textSize === 'lg') setTextSizeState('md');
    else if (textSize === 'md') setTextSizeState('sm');
  };

  const t = (keyOrPhrase: string, fallback?: string): string => {
    return translateFn(keyOrPhrase, language, fallback);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        language,
        setLanguage,
        t,
        textSize,
        setTextSize: setTextSizeState,
        increaseTextSize,
        decreaseTextSize,
        highContrast,
        toggleHighContrast: () => setHighContrast(prev => !prev),
        reducedMotion,
        toggleReducedMotion: () => setReducedMotion(prev => !prev)
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { t, language, setLanguage } = useAccessibility();
  return { t, language, setLanguage };
};

