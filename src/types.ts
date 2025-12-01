export type DBConnectionStatus = {
  success: boolean;
  message: string;
};

export type SchemaColumn = {
  name: string;
  type: string;
  isNullable: boolean;
};

export type SchemaTable = {
  tableName: string;
  columns: SchemaColumn[];
};

export type Schema = SchemaTable[];

export type QueryResult = {
  columns: string[];
  rows: Record<string, unknown>[];
};

export type AIMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type Connection = {
  id: string;
  name: string;
  connectionString: string;
  color: string;
};
