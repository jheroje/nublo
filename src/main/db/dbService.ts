import { ipcMain } from 'electron';
import { Client } from 'pg';
import { QueryResult, Schema, SchemaTable } from 'src/types';

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
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
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
      });
    });

    return Object.values(tables);
  });

  ipcMain.handle(
    'db:runQuery',
    async (_, connectionString: string, sql: string): Promise<QueryResult> => {
      const client = new Client({ connectionString });

      await client.connect();

      const res = await client.query(sql);

      await client.end();

      return {
        columns: res.fields.map(({ name }, i) => ({ __id: `col-${i}`, name })),
        rows: res.rows.map((row, i) => ({ __id: `row-${i}`, row })),
      };
    }
  );
}
