import { AISettings } from '@common/ai/types';
import { createContext, useContext } from 'react';

export type SettingsContextType = {
  settings: AISettings;
  updateSettings: (settings: AISettings) => Promise<void>;
};

export const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
