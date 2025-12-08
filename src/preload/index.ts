import { AIApi, Api, DBApi, StoreApi } from '@preload/types';
import { contextBridge, ipcRenderer } from 'electron';

const dbApi: DBApi = {
  testConnection: (connectionString) => ipcRenderer.invoke('db:testConnection', connectionString),
  getSchema: (connectionString) => ipcRenderer.invoke('db:getSchema', connectionString),
  runQuery: (connectionString, sql) => ipcRenderer.invoke('db:runQuery', connectionString, sql),
};

const aiApi: AIApi = {
  generateQuery: async (schema, prompt, provider, model, onStatus) => {
    const statusListener = (_: Electron.IpcRendererEvent, status: string) => {
      if (onStatus) onStatus(status);
    };
    ipcRenderer.on('ai:status', statusListener);

    try {
      const result = await ipcRenderer.invoke('ai:generateQuery', schema, prompt, provider, model);

      if (result.success) {
        return result.query;
      } else {
        throw new Error(result.error || 'Failed to generate query.');
      }
    } finally {
      ipcRenderer.removeListener('ai:status', statusListener);
    }
  },
};

const storeApi: StoreApi = {
  get: (key) => ipcRenderer.invoke('store:get', key),
  set: (key, value) => ipcRenderer.invoke('store:set', key, value),
  delete: (key) => ipcRenderer.invoke('store:delete', key),
};

const api: Api = {
  db: dbApi,
  ai: aiApi,
  store: storeApi,
};

contextBridge.exposeInMainWorld('api', api);
