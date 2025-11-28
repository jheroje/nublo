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

export type Api = {
  db: DBApi;
  ai: AIApi;
};
