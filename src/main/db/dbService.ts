import { QueryResult, Schema, SchemaTable } from '@common/db/types';
import { ipcMain } from 'electron';
import { Client } from 'pg';

export function setupDBService(): void {
  ipcMain.handle('db:testConnection', async (_, connectionString: string): Promise<void> => {
    const client = new Client({ connectionString });

    try {
      await client.connect();

      await client.query('SELECT NOW()');

      await client.end();
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      throw new Error(errorMessage || 'Connection failed');
    }
  });

  ipcMain.handle('db:getSchema', async (_, connectionString: string): Promise<Schema> => {
    const client = new Client({ connectionString });

    await client.connect();

    const res = await client.query(`
      WITH key_flags AS (
          SELECT 
              kcu.table_schema,
              kcu.table_name,
              kcu.column_name,
              BOOL_OR(tc.constraint_type = 'PRIMARY KEY') AS is_primary_key,
              BOOL_OR(tc.constraint_type = 'FOREIGN KEY') AS is_foreign_key
          FROM information_schema.key_column_usage kcu
          JOIN information_schema.table_constraints tc
            ON  tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          GROUP BY
              kcu.table_schema,
              kcu.table_name,
              kcu.column_name
      )
      SELECT
          c.table_name,
          c.column_name,
          c.data_type,
          c.is_nullable,
          COALESCE(k.is_primary_key, false) AS is_primary_key,
          COALESCE(k.is_foreign_key, false) AS is_foreign_key
      FROM information_schema.columns c
      LEFT JOIN key_flags k
        ON  c.table_schema = k.table_schema
        AND c.table_name  = k.table_name
        AND c.column_name = k.column_name
      WHERE c.table_schema = 'public'
      ORDER BY c.table_name, c.ordinal_position;
    `);

    await client.end();

    const tables: Record<string, SchemaTable> = {};

    res.rows.forEach((row) => {
      if (!tables[row.table_name]) {
        tables[row.table_name] = {
          tableName: row.table_name,
          columns: [],
        };
      }
      tables[row.table_name].columns.push({
        name: row.column_name,
        type: row.data_type,
        isNullable: row.is_nullable === 'YES',
        isPrimaryKey: row.is_primary_key,
        isForeignKey: row.is_foreign_key,
      });
    });

    return Object.values(tables);
  });

  ipcMain.handle(
    'db:runQuery',
    async (_, connectionString: string, sql: string): Promise<QueryResult> => {
      const client = new Client({ connectionString });

      await client.connect();

      const res = await client.query({ text: sql, rowMode: 'array' });

      await client.end();

      return {
        columns: res.fields.map(({ name }, i) => ({ __columnId: `col-${i}`, name })),
        rows: res.rows.map((row, rowIndex) => ({
          __rowId: `row-${rowIndex}`,
          values: res.fields.map((_, colIndex) => row[colIndex]),
        })),
      };
    }
  );
}
