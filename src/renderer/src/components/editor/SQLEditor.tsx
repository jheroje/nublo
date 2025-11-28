import { monaco } from '@renderer/components/editor/monaco-config';
import { useEffect, useRef } from 'react';
import MonacoEditor, { MonacoEditorHandle } from 'react-monaco-editor';

interface EditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  onExecute: () => void;
}

export const Editor = ({ value, onChange, onExecute }: EditorProps): React.JSX.Element => {
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

  return (
    <MonacoEditor
      ref={monacoRef}
      language="sql"
      theme="vs-dark"
      value={value}
      onChange={onChange}
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        padding: { top: 16 },
        contextmenu: false,
        selectOnLineNumbers: true,
        automaticLayout: true,
        scrollbar: {
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
        },
      }}
    />
  );
};
