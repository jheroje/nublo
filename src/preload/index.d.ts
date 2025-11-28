import { ElectronAPI } from '@electron-toolkit/preload';
import { DBConnectionStatus, QueryResult, SchemaResult } from '../types';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      db: {
        testConnection: (connString: string) => Promise<DBConnectionStatus>;
        getSchema: (connString: string) => Promise<SchemaResult>;
        runQuery: (connString: string, sql: string) => Promise<QueryResult>;
      };
      ai: {
        generateQuery: (schema: SchemaResult, prompt: string) => Promise<string>;
      };
    };
  }
}
