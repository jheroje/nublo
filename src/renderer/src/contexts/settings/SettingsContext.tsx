import { AppearanceTheme, Settings } from '@common/settings/types';
import { createContext, useContext } from 'react';

export type SettingsContextType = {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  getTheme: () => AppearanceTheme;
};

export const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
