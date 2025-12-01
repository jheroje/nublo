import * as monaco from 'monaco-editor';
import { Schema } from 'src/types';

// SQL Keywords
const SQL_KEYWORDS = [
  'SELECT',
  'FROM',
  'WHERE',
  'INSERT',
  'UPDATE',
  'DELETE',
  'CREATE',
  'DROP',
  'ALTER',
  'TABLE',
  'INDEX',
  'VIEW',
  'JOIN',
  'INNER',
  'LEFT',
  'RIGHT',
  'FULL',
  'OUTER',
  'CROSS',
  'ON',
  'AND',
  'OR',
  'NOT',
  'IN',
  'BETWEEN',
  'LIKE',
  'IS',
  'NULL',
  'AS',
  'DISTINCT',
  'ORDER',
  'BY',
  'GROUP',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'UNION',
  'INTERSECT',
  'EXCEPT',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'EXISTS',
  'ANY',
  'ALL',
  'ASC',
  'DESC',
  'INTO',
  'VALUES',
  'SET',
  'DEFAULT',
  'PRIMARY',
  'KEY',
  'FOREIGN',
  'REFERENCES',
  'UNIQUE',
  'CHECK',
  'CONSTRAINT',
  'CASCADE',
  'TRUNCATE',
  'GRANT',
  'REVOKE',
  'USING',
];

// SQL Functions
const SQL_FUNCTIONS = [
  'COUNT',
  'SUM',
  'AVG',
  'MAX',
  'MIN',
  'COALESCE',
  'NULLIF',
  'CAST',
  'CONVERT',
  'UPPER',
  'LOWER',
  'TRIM',
  'LTRIM',
  'RTRIM',
  'SUBSTRING',
  'CONCAT',
  'LENGTH',
  'REPLACE',
  'NOW',
  'CURRENT_DATE',
  'CURRENT_TIME',
  'CURRENT_TIMESTAMP',
  'DATE_TRUNC',
  'EXTRACT',
  'TO_CHAR',
  'TO_DATE',
  'TO_TIMESTAMP',
  'ROUND',
  'FLOOR',
  'CEIL',
  'ABS',
  'POWER',
  'SQRT',
  'RANDOM',
];

// SQL Data Types
const SQL_TYPES = [
  'INTEGER',
  'BIGINT',
  'SMALLINT',
  'DECIMAL',
  'NUMERIC',
  'REAL',
  'DOUBLE',
  'VARCHAR',
  'CHAR',
  'TEXT',
  'BOOLEAN',
  'DATE',
  'TIME',
  'TIMESTAMP',
  'INTERVAL',
  'JSON',
  'JSONB',
  'UUID',
  'BYTEA',
  'ARRAY',
];

/**
 * Gets the text context around the cursor for better suggestions
 */
function getLineContext(model: monaco.editor.ITextModel, position: monaco.Position): string {
  const lineContent = model.getLineContent(position.lineNumber);
  const textBeforeCursor = lineContent.substring(0, position.column - 1);
  return textBeforeCursor.toUpperCase();
}

/**
 * Gets the full query text to understand broader context
 */
function getFullQueryContext(model: monaco.editor.ITextModel, position: monaco.Position): string {
  let fullText = '';

  // Get all text up to current position
  for (let i = 1; i <= position.lineNumber; i++) {
    if (i < position.lineNumber) {
      fullText += model.getLineContent(i) + ' ';
    } else {
      // For current line, only get text before cursor
      fullText += model.getLineContent(i).substring(0, position.column - 1);
    }
  }

  return fullText.toUpperCase();
}

/**
 * Checks if we're typing after a table name or alias with a dot (e.g., "users." or "u.")
 */
function getTableNameBeforeDot(
  context: string,
  model: monaco.editor.ITextModel,
  position: monaco.Position
): string | null {
  // First check the context string
  const contextMatch = context.match(/\b(\w+)\.\s*$/i);

  if (contextMatch) {
    return contextMatch[1].toLowerCase();
  }

  // If dot is the trigger character, check the character just before cursor
  const lineContent = model.getLineContent(position.lineNumber);
  const charBeforeCursor = lineContent.charAt(position.column - 2);

  if (charBeforeCursor === '.') {
    // Look backwards to find the word before the dot
    const textBeforeDot = lineContent.substring(0, position.column - 2);
    const match = textBeforeDot.match(/\b(\w+)$/i);
    return match ? match[1].toLowerCase() : null;
  }

  return null;
}

/**
 * Checks if we're in a context where table names should be suggested
 */
function shouldSuggestTables(context: string): boolean {
  return /\b(FROM|JOIN|INTO|UPDATE|TABLE)\s+\w*$/i.test(context);
}

/**
 * Checks if we're in a SELECT context where columns should be suggested
 */
function shouldSuggestColumns(context: string, fullContext: string, word: string): boolean {
  // Check if we're after a comma (in SELECT list)
  if (/,\s*\w*$/i.test(context)) {
    return true;
  }

  // Check if we're right after SELECT keyword with no partial word typed
  // or with a very short partial word (1-2 chars) that might be an alias
  if (/\bSELECT\s+$/i.test(context)) {
    return true;
  }

  // If we're typing after SELECT with a partial word, only suggest columns
  // if the word is longer (likely typing a column name, not an alias)
  if (/\bSELECT\s+\w+$/i.test(context)) {
    // If word is short (1-3 chars), prefer showing aliases over columns
    if (word.length <= 3) {
      return false; // Let it fall through to show aliases
    }
    return true;
  }

  // Check if we're in the SELECT clause (between SELECT and FROM)
  // Look at full context to see if we're after SELECT but haven't reached FROM yet on this line
  const lastSelectIndex = fullContext.lastIndexOf('SELECT');
  const lastFromIndex = fullContext.lastIndexOf('FROM');

  // If we have a SELECT and either no FROM, or the FROM is before the SELECT (subquery case)
  if (lastSelectIndex !== -1 && (lastFromIndex === -1 || lastFromIndex < lastSelectIndex)) {
    // Make sure we're not in a table context (after FROM/JOIN on current line)
    if (!/\b(FROM|JOIN|INTO|UPDATE|TABLE)\s+\w*$/i.test(context)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if we're in a context where columns with table/alias prefixes should be suggested
 * (e.g., after ON, WHERE, AND, OR, or comparison operators)
 */
function shouldSuggestColumnsWithAliases(context: string): boolean {
  // Match contexts like "ON ", "WHERE ", "AND ", "OR ", "= ", "!= ", etc.
  return /\b(ON|WHERE|AND|OR|HAVING)\s+\w*$/i.test(context) || /[=!<>]+\s*\w*$/i.test(context);
}

/**
 * Represents a table alias mapping
 */
type TableAlias = {
  tableName: string;
  alias: string;
};

/**
 * Extracts table aliases from the entire query
 * Returns an array of table-alias pairs to support self-joins
 */
function extractTableAliases(model: monaco.editor.ITextModel): TableAlias[] {
  const aliases: TableAlias[] = [];
  const fullText = model.getValue();

  // Helper to parse table + alias (supports optional AS)
  const extractAlias = (table: string): TableAlias | null => {
    const parts = table.trim().split(/\s+/);
    let tableName: string, alias: string;

    if (parts.length === 3 && parts[1].toUpperCase() === 'AS') {
      [tableName, alias] = [parts[0], parts[2]];
    } else if (parts.length >= 2) {
      [tableName, alias] = [parts[0], parts[1]];
    } else {
      return null;
    }

    if (SQL_KEYWORDS.includes(alias.toUpperCase())) return null;
    return { tableName: tableName.toLowerCase(), alias };
  };

  // FROM clause (multiple tables)
  const fromPattern = /\bFROM\b\s+([\s\S]*?)(?=\b(JOIN|WHERE|GROUP|ORDER|LIMIT|$)\b)/gi;

  for (const match of fullText.matchAll(fromPattern)) {
    const tables = match[1].split(',').map((s) => s.trim());

    for (const table of tables) {
      const result = extractAlias(table);
      if (result) aliases.push(result);
    }
  }

  // JOIN clauses (single table)
  const joinPattern = /\bJOIN\b\s+([\s\S]*?)(?=\bON\b|\bUSING\b|$)/gi;

  for (const match of fullText.matchAll(joinPattern)) {
    const result = extractAlias(match[1]);
    if (result) aliases.push(result);
  }

  return aliases;
}

/**
 * Creates Monaco completion items for SQL keywords
 */
function createKeywordCompletions(range: monaco.IRange): monaco.languages.CompletionItem[] {
  return SQL_KEYWORDS.map((keyword) => ({
    label: keyword,
    kind: monaco.languages.CompletionItemKind.Keyword,
    insertText: keyword,
    range,
    detail: 'SQL Keyword',
    sortText: `1_${keyword}`, // Sort keywords first
  }));
}

/**
 * Creates Monaco completion items for SQL functions
 */
function createFunctionCompletions(range: monaco.IRange): monaco.languages.CompletionItem[] {
  return SQL_FUNCTIONS.map((func) => ({
    label: func,
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `${func}($0)`,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
    detail: 'SQL Function',
    sortText: `2_${func}`,
  }));
}

/**
 * Creates Monaco completion items for SQL data types
 */
function createTypeCompletions(range: monaco.IRange): monaco.languages.CompletionItem[] {
  return SQL_TYPES.map((type) => ({
    label: type,
    kind: monaco.languages.CompletionItemKind.TypeParameter,
    insertText: type,
    range,
    detail: 'SQL Type',
    sortText: `3_${type}`,
  }));
}

/**
 * Creates Monaco completion items for table names
 */
function createTableCompletions(
  schema: Schema,
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  return schema.map((table) => ({
    label: table.tableName,
    kind: monaco.languages.CompletionItemKind.Class,
    insertText: table.tableName,
    range,
    detail: `Table (${table.columns.length} columns)`,
    documentation: table.columns.map((col) => `${col.name}: ${col.type}`).join('\n'),
    sortText: `0_${table.tableName}`, // Sort tables before keywords in table context
  }));
}

/**
 * Creates Monaco completion items for table aliases
 */
function createAliasCompletions(
  tableAliases: TableAlias[],
  schema: Schema,
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  return tableAliases.map((aliasInfo) => {
    const table = schema.find((t) => t.tableName.toLowerCase() === aliasInfo.tableName);

    return {
      label: aliasInfo.alias,
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: aliasInfo.alias,
      range,
      detail: `Alias for ${aliasInfo.tableName}`,
      documentation: table
        ? `Table: ${table.tableName}\n${table.columns.length} columns`
        : undefined,
      sortText: `0_${aliasInfo.alias}`,
    };
  });
}

/**
 * Creates Monaco completion items for column names
 */
function createColumnCompletions(
  schema: Schema,
  range: monaco.IRange,
  tableName?: string,
  tableAliases?: TableAlias[]
): monaco.languages.CompletionItem[] {
  const completions: monaco.languages.CompletionItem[] = [];

  schema.forEach((table) => {
    // If a specific table is requested, only show columns from that table
    if (tableName && table.tableName.toLowerCase() !== tableName.toLowerCase()) {
      return;
    }

    if (tableName) {
      // When typing after a dot (e.g., "users." or "u."), just show column name
      table.columns.forEach((column) => {
        completions.push({
          label: column.name,
          kind: monaco.languages.CompletionItemKind.Field,
          insertText: column.name,
          range,
          detail: `${column.type}${column.isNullable ? ' (nullable)' : ''}`,
          documentation: `Column from table: ${table.tableName}`,
          sortText: `0_${column.name}`,
        });
      });
    } else {
      // In SELECT/ON/WHERE context, show table.column or alias.column
      // Find ALL aliases for this table (to support self-joins)
      const aliasesForTable =
        tableAliases?.filter((a) => a.tableName === table.tableName.toLowerCase()) || [];

      if (aliasesForTable.length > 0) {
        // Create column suggestions for each alias
        aliasesForTable.forEach((aliasInfo) => {
          table.columns.forEach((column) => {
            const label = `${aliasInfo.alias}.${column.name}`;
            const insertText = `${aliasInfo.alias}.${column.name}`;

            completions.push({
              label,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText,
              range,
              detail: `${column.type}${column.isNullable ? ' (nullable)' : ''}`,
              documentation: `Column from table: ${table.tableName} (alias: ${aliasInfo.alias})`,
              sortText: `0_${label}`,
            });
          });
        });
      } else {
        // No aliases, use table name
        table.columns.forEach((column) => {
          const label = `${table.tableName}.${column.name}`;
          const insertText = `${table.tableName}.${column.name}`;

          completions.push({
            label,
            kind: monaco.languages.CompletionItemKind.Field,
            insertText,
            range,
            detail: `${column.type}${column.isNullable ? ' (nullable)' : ''}`,
            documentation: `Column from table: ${table.tableName}`,
            sortText: `0_${label}`,
          });
        });
      }
    }
  });

  return completions;
}

/**
 * Registers SQL autocomplete provider with Monaco
 */
export function registerSQLAutocomplete(schema: Schema): monaco.IDisposable {
  return monaco.languages.registerCompletionItemProvider('sql', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);

      const range: monaco.IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const lineContext = getLineContext(model, position);
      const fullContext = getFullQueryContext(model, position);
      const tableAliases = extractTableAliases(model);

      // Check if we're typing after a table name or alias with a dot (e.g., "users." or "u.")
      const tableBeforeDot = getTableNameBeforeDot(lineContext, model, position);

      const suggestions: monaco.languages.CompletionItem[] = [];

      if (tableBeforeDot) {
        // Check if this is an alias, and if so, find the actual table name
        let actualTableName = tableBeforeDot;

        // Check if tableBeforeDot is an alias
        const aliasInfo = tableAliases.find((a) => a.alias === tableBeforeDot);

        if (aliasInfo) {
          actualTableName = aliasInfo.tableName;
        }

        // Only suggest columns from the specific table
        suggestions.push(...createColumnCompletions(schema, range, actualTableName));
      } else if (shouldSuggestTables(lineContext)) {
        // Suggest table names in FROM, JOIN, etc. contexts
        suggestions.push(...createTableCompletions(schema, range));
      } else if (shouldSuggestColumns(lineContext, fullContext, word.word)) {
        // Suggest all columns (with table prefix or alias) in SELECT context
        suggestions.push(...createColumnCompletions(schema, range, undefined, tableAliases));
      } else if (shouldSuggestColumnsWithAliases(lineContext)) {
        // Suggest columns with aliases in ON, WHERE, etc. contexts
        suggestions.push(...createColumnCompletions(schema, range, undefined, tableAliases));
        // Also suggest aliases themselves
        if (tableAliases.length > 0) {
          suggestions.push(...createAliasCompletions(tableAliases, schema, range));
        }
      } else {
        // Default: suggest keywords, functions, types
        suggestions.push(...createKeywordCompletions(range));
        suggestions.push(...createFunctionCompletions(range));
        suggestions.push(...createTypeCompletions(range));

        // Also suggest table aliases if any exist
        if (tableAliases.length > 0) {
          suggestions.push(...createAliasCompletions(tableAliases, schema, range));
        }
      }

      return { suggestions };
    },
  });
}
