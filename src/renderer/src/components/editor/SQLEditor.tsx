import { Schema } from '@common/types';
import { monaco } from '@renderer/components/editor/monaco-config';
import React, { useEffect, useRef } from 'react';
import MonacoEditor, { MonacoEditorHandle } from 'react-monaco-editor';
import { registerSQLAutocomplete } from './sql-autocomplete';

type EditorProps = {
  value: string;
  onChange: (value: string | undefined) => void;
  onExecute: () => void;
  schema: Schema;
};

export const Editor = ({ value, onChange, onExecute, schema }: EditorProps): React.JSX.Element => {
  const monacoRef = useRef<MonacoEditorHandle | null>(null);

  useEffect(() => {
    const editor = monacoRef.current?.editor;

    if (!editor) return;

    const disposable = editor.addAction({
      id: 'execute-query',
      label: 'Execute Query',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => {
        onExecute();
      },
    });

    return () => {
      disposable.dispose();
    };
  }, [onExecute]);

  useEffect(() => {
    const disposable = registerSQLAutocomplete(schema);

    return () => {
      disposable.dispose();
    };
  }, [schema]);

  return (
    <MonacoEditor
      ref={monacoRef}
      language="sql"
      theme="github-dark"
      value={value}
      onChange={onChange}
      options={{
        minimap: { enabled: false },
        fontSize: 12,
        padding: { top: 16 },
        contextmenu: false,
        selectOnLineNumbers: true,
        automaticLayout: true,
        scrollbar: {
          verticalScrollbarSize: 6,
          horizontalScrollbarSize: 6,
        },
        suggestOnTriggerCharacters: true,
        quickSuggestions: {
          other: true,
          comments: false,
          strings: false,
        },
        suggest: {
          showKeywords: true,
          showSnippets: true,
        },
        lineNumbersMinChars: 3,
        folding: false,
      }}
    />
  );
};
