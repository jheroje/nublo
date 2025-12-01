import { ipcMain } from 'electron';
import { Client } from 'pg';
import { DBConnectionStatus, QueryResult, Schema, SchemaTable } from 'src/types';

export function setupDBService(): void {
  ipcMain.handle(
    'db:testConnection',
    async (_, connString: string): Promise<DBConnectionStatus> => {
      const client = new Client({ connectionString: connString });

      try {
        await client.connect();
        await client.query('SELECT NOW()');
        await client.end();
        return { success: true, message: 'Connection successful' };
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Connection failed',
        };
      }
    }
  );

  ipcMain.handle('db:getSchema', async (_, connString: string): Promise<Schema> => {
    const client = new Client({ connectionString: connString });

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
    async (_, connString: string, sql: string): Promise<QueryResult> => {
      const client = new Client({ connectionString: connString });

      await client.connect();
      const res = await client.query(sql);
      await client.end();
      return {
        columns: res.fields.map((f) => f.name),
        rows: res.rows,
      };
    }
  );
}
