import { QueryResult, Schema } from '@common/db/types';
import { StoreSchema } from '@common/store/types';

export type DBApi = {
  testConnection: (connectionString: string) => Promise<void>;
  getSchema: (connectionString: string) => Promise<Schema>;
  runQuery: (connectionString: string, sql: string) => Promise<QueryResult>;
};

export type AIApi = {
  generateQuery: (
    schema: Schema,
    prompt: string,
    provider: string,
    model: string,
    onStatus: (status: string) => void
  ) => Promise<string>;
};

export type StoreApi = {
  get<K extends keyof StoreSchema>(key: K): Promise<StoreSchema[K]>;
  set<K extends keyof StoreSchema>(key: K, value: StoreSchema[K]): Promise<void>;
  delete(key: keyof StoreSchema): Promise<void>;
};

export type Api = {
  db: DBApi;
  ai: AIApi;
  store: StoreApi;
};
