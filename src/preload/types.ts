import { DBConnectionStatus, QueryResult, SchemaResult } from '../types';

export type DBApi = {
  testConnection: (connString: string) => Promise<DBConnectionStatus>;
  getSchema: (connString: string) => Promise<SchemaResult>;
  runQuery: (connString: string, sql: string) => Promise<QueryResult>;
};

export type AIApi = {
  streamQuery: (
    schema: SchemaResult,
    prompt: string,
    model: string,
    onChunk: (chunk: string) => void,
    onEnd: () => void,
    onError: (error: string) => void,
    onComplete: (sql: string) => void
  ) => () => void;
};

export interface StoreApi {
  get: <T>(key: string) => Promise<T>;
  set: (key: string, value: any) => Promise<void>;
  delete: (key: string) => Promise<void>;
}

export type Api = {
  db: DBApi;
  ai: AIApi;
  store: StoreApi;
};
