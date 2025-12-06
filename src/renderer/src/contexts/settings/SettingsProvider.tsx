import { AIProvider, AISettings } from '@common/types';
import React, { useCallback, useEffect, useState } from 'react';
import { SettingsContext } from './SettingsContext';

type SettingsProviderProps = {
  children: React.ReactNode;
};

const DEFAULT_AI_SETTINGS: AISettings = {
  providers: Object.fromEntries(Object.values(AIProvider).map((p) => [p, ''])),
};

export const SettingsProvider = ({ children }: SettingsProviderProps): React.JSX.Element => {
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const saved = await window.api.store.get('ai_settings');
      setAiSettings(saved || DEFAULT_AI_SETTINGS);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setAiSettings(DEFAULT_AI_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateAiSettings = async (newSettings: AISettings): Promise<void> => {
    try {
      await window.api.store.set('ai_settings', newSettings);
      setAiSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ aiSettings, updateAiSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};
