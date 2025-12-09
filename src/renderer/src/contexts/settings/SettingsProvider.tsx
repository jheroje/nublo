import { AppearanceTheme, Settings } from '@common/settings/types';
import React, { useEffect, useState } from 'react';
import { SettingsContext } from './SettingsContext';

type SettingsProviderProps = {
  children: React.ReactNode;
};

const resolveTheme = (theme?: AppearanceTheme) => {
  if (theme === 'system' || !theme) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
};

const applyTheme = (theme: AppearanceTheme) => {
  const resolvedTheme = resolveTheme(theme);

  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolvedTheme);
};

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<Settings | null>(null);

  const getTheme = () => {
    return resolveTheme(settings?.appearance.theme);
  };

  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await window.api.store.get('settings');

      const initialSettings: Settings = savedSettings || {
        ai: { providers: {} },
        appearance: { theme: 'system' },
      };

      setSettings(initialSettings);
      applyTheme(initialSettings.appearance.theme);
    };
    loadSettings();
  }, []);

  const updateSettings = async (newSettingsPartial: Partial<Settings>): Promise<void> => {
    if (!settings) return;

    const newSettings = { ...settings, ...newSettingsPartial };

    try {
      await window.api.store.set('settings', newSettings);

      if (newSettingsPartial.appearance) {
        applyTheme(newSettings.appearance.theme);
      }
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  };

  if (!settings) return null;

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, getTheme }}>
      {children}
    </SettingsContext.Provider>
  );
};
