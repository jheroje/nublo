export const ConnectionColors = [
  'red-500',
  'orange-500',
  'amber-500',
  'yellow-500',
  'lime-500',
  'green-500',
  'emerald-500',
  'teal-500',
  'cyan-500',
  'sky-500',
  'blue-500',
  'indigo-500',
  'violet-500',
  'purple-500',
  'fuchsia-500',
  'pink-500',
  'rose-500',
  'gray-500',
  'neutral-500',
  'stone-500',
  'slate-500',
  'zinc-500',
] as const;

export type ConnectionColor = (typeof ConnectionColors)[number];

export type Connection = {
  id: string;
  name: string;
  connectionString: string;
  color: ConnectionColor;
};

export type DBConnectionStatus = {
  success: boolean;
  message: string;
};

export type SchemaColumn = {
  name: string;
  type: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
};

export type SchemaTable = {
  tableName: string;
  columns: SchemaColumn[];
};

export type Schema = SchemaTable[];

export type QueryColumn = {
  __columnId: string;
  name: string;
};

export type QueryRow = {
  __rowId: string;
  values: unknown[];
};

export type QueryResult = {
  columns: QueryColumn[];
  rows: QueryRow[];
};
