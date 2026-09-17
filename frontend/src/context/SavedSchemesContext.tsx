import React, { createContext, useContext, useState, useEffect } from 'react';
import { Scheme } from '../types';
import { MOCK_SCHEMES } from '../data/mockSchemes';
import { useToast } from './ToastContext';

import { schemeService } from '../services/schemeService';

interface SavedSchemesContextType {
  savedSchemeIds: string[];
  savedSchemes: Scheme[];
  isSaved: (schemeId: string) => boolean;
  toggleSave: (scheme: Scheme) => void;
}

const SavedSchemesContext = createContext<SavedSchemesContextType | undefined>(undefined);

export const SavedSchemesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [allSchemes, setAllSchemes] = useState<Scheme[]>(MOCK_SCHEMES);
  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('sevaai_saved_schemes');
      const parsed = stored ? JSON.parse(stored) : null;
      return Array.isArray(parsed) ? parsed : ['GOI-AGRI-001', 'GOI-HLTH-002'];
    } catch {
      return ['GOI-AGRI-001', 'GOI-HLTH-002'];
    }
  });

  useEffect(() => {
    schemeService.getAllSchemes().then(schemes => {
      if (schemes && schemes.length > 0) {
        setAllSchemes(schemes);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem('sevaai_saved_schemes', JSON.stringify(savedSchemeIds));
  }, [savedSchemeIds]);

  const isSaved = (schemeId: string) => savedSchemeIds.includes(schemeId);

  const toggleSave = (scheme: Scheme) => {
    const id = scheme.scheme_id;
    if (isSaved(id)) {
      setSavedSchemeIds(prev => prev.filter(item => item !== id));
      showToast(`${scheme.short_name} removed from saved schemes`, 'info');
    } else {
      setSavedSchemeIds(prev => [...prev, id]);
      showToast(`${scheme.short_name} saved for easy access`, 'success');
    }
  };

  const savedSchemes = allSchemes.filter(s => savedSchemeIds.includes(s.scheme_id));

  return (
    <SavedSchemesContext.Provider
      value={{
        savedSchemeIds,
        savedSchemes,
        isSaved,
        toggleSave
      }}
    >
      {children}
    </SavedSchemesContext.Provider>
  );
};

export const useSavedSchemes = (): SavedSchemesContextType => {
  const context = useContext(SavedSchemesContext);
  if (!context) {
    throw new Error('useSavedSchemes must be used within a SavedSchemesProvider');
  }
  return context;
};
