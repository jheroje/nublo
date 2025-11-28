import { contextBridge, ipcRenderer } from 'electron';
import { DBConnectionStatus, QueryResult, SchemaResult } from '../types';

const dbApi = {
  testConnection: (connString: string): Promise<DBConnectionStatus> =>
    ipcRenderer.invoke('dbService:testConnection', connString),
  getSchema: (connString: string): Promise<SchemaResult> =>
    ipcRenderer.invoke('dbService:getSchema', connString),
  runQuery: (connString: string, sql: string): Promise<QueryResult> =>
    ipcRenderer.invoke('dbService:runQuery', connString, sql),
};

const aiApi = {
  generateQuery: (schema: SchemaResult, prompt: string): Promise<string> =>
    ipcRenderer.invoke('aiService:generateQuery', schema, prompt),
};

contextBridge.exposeInMainWorld(
  'api',
  Object.freeze({
    db: Object.freeze(dbApi),
    ai: Object.freeze(aiApi),
  })
);
