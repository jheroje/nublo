import { QueryResult, Schema } from 'src/types';

export type DBApi = {
  testConnection: (connectionString: string) => Promise<void>;
  getSchema: (connectionString: string) => Promise<Schema>;
  runQuery: (connectionString: string, sql: string) => Promise<QueryResult>;
};

export type AIApi = {
  generateQuery: (
    schema: Schema,
    prompt: string,
    model: string,
    onStatus: (status: string) => void
  ) => Promise<string>;
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
