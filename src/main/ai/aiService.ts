import { ipcMain } from 'electron';
import OpenAI from 'openai';
import { format } from 'sql-formatter';
import { Schema } from 'src/types';

export function setupAIService(): void {
  const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  ipcMain.on('ai:streamQuery', async (event, schema: Schema, prompt: string, model: string) => {
    let fullResponse = '';

    try {
      const schemaString = JSON.stringify(schema, null, 2);

      const systemPrompt = `
        You are a PostgreSQL SQL expert. Generate a SQL query based on the user prompt and the provided database schema.

        Schema:
        ${schemaString}
        
        Output Format Rule:
          1. Your entire response MUST be a single JSON object.
          2. The JSON object MUST contain a key named "query".
          3. The value of the "query" key MUST be the raw PostgreSQL query string.
          4. Prefer to use statements such as ilike instead of equality (=) when possible.
          5. DO NOT include any text, explanations, or markdown outside of the JSON object.
        
        Example of desired output:
        { "query": "SELECT id, name FROM users WHERE age > 30;" }
        `;

      const stream = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          event.sender.send('ai:stream-chunk', content);
          fullResponse += content;
        }
      }

      event.sender.send('ai:stream-end');

      let cleanJsonString = fullResponse.trim();

      if (cleanJsonString.startsWith('```json')) {
        cleanJsonString = cleanJsonString.substring('```json'.length).trim();
      }
      if (cleanJsonString.endsWith('```')) {
        cleanJsonString = cleanJsonString
          .substring(0, cleanJsonString.length - '```'.length)
          .trim();
      }

      const parsedJson = JSON.parse(cleanJsonString);
      let finalSql = parsedJson.query;

      finalSql = format(finalSql, { language: 'postgresql' });

      event.sender.send('ai:query-complete', finalSql);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      event.sender.send(
        'ai:stream-error',
        JSON.stringify({
          message: errorMessage || 'Unknown error during stream processing.',
          response: fullResponse,
        })
      );
    }
  });
}
