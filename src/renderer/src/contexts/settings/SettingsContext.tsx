import { AISettings } from '@common/types';
import { createContext, useContext } from 'react';

export type SettingsContextType = {
  aiSettings: AISettings | null;
  updateAiSettings: (settings: AISettings) => Promise<void>;
  isLoading: boolean;
};

export const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
