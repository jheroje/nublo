import { AIApi, Api, DBApi, StoreApi } from '@preload/types';
import { contextBridge, ipcRenderer } from 'electron';

const dbApi: DBApi = {
  testConnection: (connString) => ipcRenderer.invoke('db:testConnection', connString),
  getSchema: (connString) => ipcRenderer.invoke('db:getSchema', connString),
  runQuery: (connString, sql) => ipcRenderer.invoke('db:runQuery', connString, sql),
};

const aiApi: AIApi = {
  streamQuery: (schema, prompt, model, onChunk, onEnd, onError, onComplete) => {
    ipcRenderer.send('ai:streamQuery', schema, prompt, model);

    const chunkListener = (_: Electron.IpcRendererEvent, chunk: string) => onChunk(chunk);
    const endListener = () => onEnd();
    const errorListener = (_: Electron.IpcRendererEvent, error: string) => onError(error);
    const completeListener = (_: Electron.IpcRendererEvent, sql: string) => onComplete(sql);

    ipcRenderer.on('ai:stream-chunk', chunkListener);
    ipcRenderer.on('ai:stream-end', endListener);
    ipcRenderer.on('ai:stream-error', errorListener);
    ipcRenderer.on('ai:query-complete', completeListener);

    return () => {
      ipcRenderer.removeListener('ai:stream-chunk', chunkListener);
      ipcRenderer.removeListener('ai:stream-end', endListener);
      ipcRenderer.removeListener('ai:stream-error', errorListener);
      ipcRenderer.removeListener('ai:query-complete', completeListener);
    };
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
