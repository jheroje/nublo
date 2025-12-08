import { AISettings } from '@common/ai/types';
import React, { useEffect, useState } from 'react';
import { SettingsContext } from './SettingsContext';

type SettingsProviderProps = {
  children: React.ReactNode;
};

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<AISettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const saved = await window.api.store.get('ai_settings');
      if (saved) {
        setSettings(saved);
      }
    };
    loadSettings();
  }, []);

  const updateSettings = async (newSettings: AISettings): Promise<void> => {
    try {
      await window.api.store.set('ai_settings', newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  };

  if (!settings) return null;

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
