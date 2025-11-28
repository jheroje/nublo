export type DBConnectionStatus = {
  success: boolean;
  message: string;
};

export type SchemaColumn = {
  name: string;
  type: string;
  is_nullable: boolean;
};

export type SchemaTable = {
  table_name: string;
  columns: SchemaColumn[];
};

export type SchemaResult = SchemaTable[];

export type QueryResult = {
  columns: string[];
  rows: Record<string, unknown>[];
};

export type AIMessage = {
  role: 'user' | 'assistant';
  content: string;
};
