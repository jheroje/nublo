import { AISettings } from '../ai/types';

export type AppearanceTheme = 'light' | 'dark' | 'system';

export type AppearanceSettings = {
  theme: AppearanceTheme;
};

export type Settings = {
  ai: AISettings;
  appearance: AppearanceSettings;
};
