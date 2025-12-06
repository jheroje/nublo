import { StoreSchema } from '@common/types';
import { ipcMain } from 'electron';
import Store from 'electron-store';

export const store = new Store<StoreSchema>({
  defaults: {
    saved_connections: [],
    ai_settings: {
      providers: {},
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
