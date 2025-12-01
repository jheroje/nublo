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

export type QueryColumn = {
  __id: string;
  name: string;
};

export type QueryRow = {
  __id: string;
  row: Record<string, unknown>;
};

export type QueryResult = {
  columns: QueryColumn[];
  rows: QueryRow[];
};

export type AIMessage = {
  role: 'user' | 'assistant';
  content: string;
};
