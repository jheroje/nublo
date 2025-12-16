import * as monaco from 'monaco-editor';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

import {
  conf as sqlConf,
  language as sqlLanguage,
} from 'monaco-editor/esm/vs/basic-languages/sql/sql.js';

const FIXED_JOIN_SQL = {
  ...sqlLanguage,
  tokenizer: {
    ...sqlLanguage.tokenizer,
    root: [
      [
        /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|ON|AS|AND|OR|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|UNION|ALL|DISTINCT|ASC|DESC|INNER|LEFT|RIGHT|FULL|CROSS|NATURAL|CUBE|ROLLUP|CREATE|ALTER|DROP|TRUNCATE|TABLE|VIEW|INDEX|SEQUENCE|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|CHECK|DEFAULT|NOT|NULL|EXISTS|IN|IS|LIKE|ILIKE|BETWEEN|CASE|WHEN|THEN|ELSE|END)\b/i,
        'keyword.sql',
      ],
      [
        /\b(ABS|ACOS|ASIN|ATAN|CEIL|CEILING|COS|EXP|FLOOR|LN|LOG|MOD|PI|POWER|ROUND|SIGN|SIN|SQRT|TAN|AVG|COUNT|MIN|MAX|SUM|STRING_AGG|ARRAY_AGG|JSON_AGG|JSON_BUILD_OBJECT|JSON_BUILD_ARRAY|COALESCE|NOW|CURRENT_DATE|CURRENT_TIMESTAMP)\b/i,
        'function.sql',
      ],
      [
        /\b(INT|INTEGER|BIGINT|SMALLINT|DECIMAL|NUMERIC|REAL|DOUBLE PRECISION|FLOAT|VARCHAR|CHAR|TEXT|BOOLEAN|DATE|TIMESTAMP|TIMESTAMPTZ|TIME|UUID|JSON|JSONB|ARRAY|SERIAL|BIGSERIAL)\b/i,
        'type.sql',
      ],
      [/\b\d+(\.\d+)?\b/, 'number.sql'],
      [/'([^']|'')*'/, 'string.sql'],
      [/--.*/, 'comment.sql'],
      [/\/\*[\s\S]*?\*\//, 'comment.sql'],
      [/[-+*/%=<>!~]+/, 'operator.sql'],
      [/[|&^@]/, 'operator.sql'],
      [/->>|->|#>/, 'operator.sql'],
      [/\|\|/, 'operator.sql'],
      [/[,;()]/, 'delimiter.sql'],
      [/\b[a-zA-Z_][a-zA-Z0-9_]*\b/, 'identifier.sql'],
      [/"[^"]+"/, 'identifier.sql'],
    ],
  },
};

monaco.languages.register({ id: 'sql' });
monaco.languages.setLanguageConfiguration('sql', sqlConf);
monaco.languages.setMonarchTokensProvider('sql', FIXED_JOIN_SQL);

const NUBLO_DARK_THEME_CONFIG: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword.sql', foreground: '805AD5', fontStyle: 'bold' },
    { token: 'operator.sql', foreground: '89DDFF' },
    { token: 'number.sql', foreground: 'F78C6C' },
    { token: 'string.sql', foreground: '81E03D' },
    { token: 'comment.sql', foreground: '546E7A', fontStyle: 'italic' },
    { token: 'function.sql', foreground: '82AAFF' },
    { token: 'identifier.sql', foreground: 'ECEFF4' },
    { token: 'type.sql', foreground: 'F78C6C' },
    { token: 'tag.sql', foreground: 'FFCB6B' },
  ],
  colors: {
    'editor.foreground': '#ECEFF4',
    'editor.background': '#09090b',
    'editorCursor.foreground': '#ECEFF4',
    'editor.lineHighlightBackground': '#0F0F13',
    'editor.selectionBackground': '#3E4E60AA',
    'editor.inactiveSelectionBackground': '#3E4E6033',
    'editorIndentGuide.background': '#2C2F38',
    'editorIndentGuide.activeBackground': '#4F5B66',
    'editorGutter.background': '#09090b',
    'editorLineNumber.foreground': '#5C6773',
    'editorLineNumber.activeForeground': '#ECEFF4',
    'editorWhitespace.foreground': '#3A3C42',
  },
};

const NUBLO_LIGHT_THEME_CONFIG: monaco.editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'keyword.sql', foreground: '805AD5', fontStyle: 'bold' },
    { token: 'operator.sql', foreground: '268BD2' },
    { token: 'number.sql', foreground: 'D0693D' },
    { token: 'string.sql', foreground: '859900' },
    { token: 'comment.sql', foreground: '65737E', fontStyle: 'italic' },
    { token: 'function.sql', foreground: '268BD2' },
    { token: 'identifier.sql', foreground: '#2E3440' },
    { token: 'type.sql', foreground: 'D0693D' },
    { token: 'tag.sql', foreground: 'B58900' },
  ],
  colors: {
    'editor.foreground': '#2E3440',
    'editor.background': '#FFFFFF',
    'editorCursor.foreground': '#2E3440',
    'editor.lineHighlightBackground': '#F5F5F5',
    'editor.selectionBackground': '#93A1A133',
    'editor.inactiveSelectionBackground': '#93A1A133',
    'editorIndentGuide.background': '#D8DEE4',
    'editorIndentGuide.activeBackground': '#4F5B66',
    'editorGutter.background': '#FFFFFF',
    'editorLineNumber.foreground': '#7B8794',
    'editorLineNumber.activeForeground': '#2E3440',
    'editorWhitespace.foreground': '#D8DEE4',
  },
};

monaco.editor.defineTheme('nublo-dark', NUBLO_DARK_THEME_CONFIG);
monaco.editor.defineTheme('nublo-light', NUBLO_LIGHT_THEME_CONFIG);

self.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

export { monaco };
