import * as monaco from 'monaco-editor';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

const NUBLO_DARK_THEME_CONFIG: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '8B949E' },
    { token: 'string', foreground: 'A5D6FF' },
    { token: 'keyword', foreground: 'FF7B72' },
    { token: 'number', foreground: '79C0FF' },
    { token: 'delimiter', foreground: 'C9D1D9' },
    { token: 'type', foreground: '79C0FF' },
    { token: 'identifier', foreground: 'C9D1D9' },
    { token: 'variable', foreground: 'C9D1D9' },
    { token: 'function', foreground: 'D2A8FF' },
    { token: 'tag', foreground: '7EE787' },
  ],
  colors: {
    'editor.foreground': '#C9D1D9',
    'editor.background': '#09090b',
    'editorGutter.background': '#09090b',
    'editorLineNumber.foreground': '#6E7681',
    'editorLineNumber.activeForeground': '#C9D1D9',
    'editorCursor.foreground': '#C9D1D9',
    'editor.selectionBackground': '#3392FF33',
    'editor.inactiveSelectionBackground': '#3392FF33',
    'editorIndentGuide.background': '#30363D',
    'editorIndentGuide.activeBackground': '#484F58',
  },
};

const NUBLO_LIGHT_THEME_CONFIG: monaco.editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6E7781' },
    { token: 'string', foreground: '0A3069' },
    { token: 'keyword', foreground: 'CF222E' },
    { token: 'number', foreground: '0550AE' },
    { token: 'delimiter', foreground: '24292F' },
    { token: 'type', foreground: '953800' },
    { token: 'identifier', foreground: '24292F' },
    { token: 'variable', foreground: '24292F' },
    { token: 'function', foreground: '8250DF' },
    { token: 'tag', foreground: '116329' },
  ],
  colors: {
    'editor.foreground': '#24292F',
    'editor.background': '#ffffff',
    'editorGutter.background': '#ffffff',
    'editorLineNumber.foreground': '#8c959f',
    'editorLineNumber.activeForeground': '#24292F',
    'editorCursor.foreground': '#24292F',
    'editor.selectionBackground': '#BBDFFF',
    'editor.inactiveSelectionBackground': '#E5EBF1',
    'editorIndentGuide.background': '#D8DEE4',
    'editorIndentGuide.activeBackground': '#30363D',
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
