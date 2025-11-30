import { ipcMain } from 'electron';
import Store from 'electron-store';

export function setupStoreService(): void {
  const store = new Store();

  ipcMain.handle('store:get', (_, key: string) => {
    return store.get(key);
  });

  ipcMain.handle('store:set', (_, key: string, value: any) => {
    store.set(key, value);
  });

  ipcMain.handle('store:delete', (_, key: string) => {
    store.delete(key);
  });
}
