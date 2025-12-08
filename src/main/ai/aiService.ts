import { AIProvider } from '@common/ai/types';
import { Schema } from '@common/db/types';
import { store } from '@main/store/storeService';
import { generateObject } from 'ai';
import { ipcMain } from 'electron';
import { format } from 'sql-formatter';
import { z } from 'zod';
import { getLanguageModel } from './providers';

const SqlQuerySchema = z.object({
  query: z.string().describe('The raw PostgreSQL SQL query string'),
});

export function setupAIService(): void {
  ipcMain.handle(
    'ai:generateQuery',
    async (event, schema: Schema, prompt: string, provider: AIProvider, model: string) => {
      event.sender.send('ai:status', 'Generating SQL query...');

      try {
        const settings = store.get('ai_settings');

        const languageModel = getLanguageModel(provider, model, settings);

        if (!languageModel) {
          throw new Error('No valid language model found from configuration');
        }

        const schemaString = JSON.stringify(schema, null, 2);

        const systemPrompt = `
          You are a PostgreSQL SQL expert. Generate a SQL query based on the user prompt and the provided database schema.

          Schema:
          ${schemaString}

          **OUTPUT INSTRUCTIONS**
            1. Your entire response **MUST** be a single JSON object.
            2. The JSON object **MUST** contain only one key named "query".
            3. The value of the "query" key **MUST** be the raw PostgreSQL query string.
            4. **CRITICAL:** DO NOT include any markdown formatting (like \`\`\`json or \`\`\`sql), explanations, or surrounding text. The response must be valid JSON, start with '{' and end with '}'.

          **IMPRECISION HANDLING (Prioritize Fuzzy Matching)**
            * **TEXT FIELDS (Strings):** For filtering on text columns (e.g., status, name, description), always assume imprecision. **MUST** use the case-insensitive pattern matching operator **\`ILIKE\`** instead of strict equality (\`=\`). Enclose the value with the wildcard character (\`%\`) on both sides for partial matching (e.g., \`status ILIKE '%complete%'\`). Only use \`=\` when the user explicitly requests an exact match.
            * **NUMERIC FIELDS (Numbers):** When the user uses terms like "around," "roughly," or "near," translate the request into a range using the **\`BETWEEN\`** operator (e.g., \`price BETWEEN 95 AND 105\`). For "over," "more than," "under," or "less than," use the appropriate **inequality operators (\`>\`, \`<\`,\`>=\`,\`<=\`).**
            * **DATE/TIME FIELDS:** Translate requests for a specific day, month, or year into an explicit **date range** (using \`>=\` and \`< to define the start and end point\`). Alternatively, use **date functions** (e.g., \`DATE_TRUNC\`, \`DATE_PART\`) to match specific components like year or month (e.g., \`DATE_PART('year', order_date) = 2024\`).

          Example of desired output:
          { "query": "SELECT id, name FROM users WHERE age > 30;" }
        `;

        const { object } = await generateObject({
          model: languageModel,
          schema: SqlQuerySchema,
          system: systemPrompt,
          prompt: prompt,
          maxRetries: 0,
        });

        event.sender.send('ai:status', 'Query generated successfully. Formatting...');

        const finalSql = format(object.query, {
          language: 'postgresql',
        });

        event.sender.send('ai:status', 'Complete.');

        return { success: true, query: finalSql };
      } catch (error) {
        console.error('AI Query Generation Error:', error);

        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error during AI processing.';

        return { success: false, error: errorMessage };
      }
    }
  );
}
