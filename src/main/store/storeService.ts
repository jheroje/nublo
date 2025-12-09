import { AIProvider } from '@common/ai/types';
import { StoreSchema } from '@common/store/types';
import { ipcMain } from 'electron';
import Store from 'electron-store';

export const store = new Store<StoreSchema>({
  defaults: {
    saved_connections: [],
    settings: {
      appearance: {
        theme: 'system',
      },
      ai: {
        providers: {
          [AIProvider.OPENROUTER]: {
            enabled: false,
            models: [
              { key: 'openai/gpt-oss-20b:free', name: 'GPT OSS 20B' },
              { key: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash' },
              { key: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B' },
            ],
            initField: { key: 'apiKey', value: '' },
          },
          [AIProvider.OPENAI]: {
            enabled: false,
            models: [{ key: 'gpt-4o-mini', name: 'GPT-4o Mini' }],
            initField: { key: 'apiKey', value: '' },
          },
          [AIProvider.GOOGLE]: {
            enabled: false,
            models: [{ key: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash' }],

            initField: { key: 'apiKey', value: '' },
          },
          [AIProvider.ANTHROPIC]: {
            enabled: false,
            models: [{ key: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' }],
            initField: { key: 'apiKey', value: '' },
          },
          [AIProvider.OLLAMA]: {
            enabled: false,
            models: [{ key: 'llama3', name: 'Llama 3' }],
            initField: { key: 'baseURL', value: '' },
          },
        },
      },
    },
  },
});

export function setupStoreService(): void {
  ipcMain.handle('store:get', (_, key: keyof StoreSchema) => {
    return store.get(key);
  });

  ipcMain.handle('store:set', (_, key: keyof StoreSchema, value: unknown) => {
    store.set(key, value);
  });

  ipcMain.handle('store:delete', (_, key: keyof StoreSchema) => {
    store.delete(key);
  });
}
