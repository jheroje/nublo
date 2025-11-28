import { ipcMain } from 'electron';
import { SchemaResult } from '../../types';

export function setupAiService(): void {
  ipcMain.handle(
    'aiService:generateQuery',
    async (_, schema: SchemaResult, prompt: string): Promise<string> => {
      const promptLower = prompt.toLowerCase();

      // Simple mock logic
      const userTable = schema.find((t) => t.table_name.toLowerCase() === 'users');

      if (promptLower.includes('users') && userTable) {
        return 'SELECT id, name, email FROM users LIMIT 10;';
      }

      // Default mock if no specific match
      if (schema.length > 0) {
        const firstTable = schema[0];
        return `SELECT * FROM ${firstTable.table_name} LIMIT 10;`;
      }

      return 'SELECT 1;';
    }
  );
}
