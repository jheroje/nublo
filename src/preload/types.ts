import { DBConnectionStatus, QueryResult, Schema } from 'src/types';

export type DBApi = {
  testConnection: (connString: string) => Promise<DBConnectionStatus>;
  getSchema: (connString: string) => Promise<Schema>;
  runQuery: (connString: string, sql: string) => Promise<QueryResult>;
};

export type AIApi = {
  streamQuery: (
    schema: Schema,
    prompt: string,
    model: string,
    onChunk: (chunk: string) => void,
    onEnd: () => void,
    onError: (error: string) => void,
    onComplete: (sql: string) => void
  ) => () => void;
};

export type StoreApi = {
  get: <T>(key: string) => Promise<T>;
  set: (key: string, value: any) => Promise<void>;
  delete: (key: string) => Promise<void>;
};

export type Api = {
  db: DBApi;
  ai: AIApi;
  store: StoreApi;
};
