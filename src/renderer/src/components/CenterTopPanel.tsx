import { Editor } from '@renderer/components/editor/SQLEditor';
import { Button } from '@renderer/shadcn/ui/button';
import React from 'react';
import { SchemaResult } from '../../../types';

interface CenterTopPanelProps {
  currentSQL: string;
  setCurrentSQL: (value: string) => void;
  isConnected: boolean;
  onRunQuery: () => void;
  schema: SchemaResult;
}

export function CenterTopPanel({
  currentSQL,
  setCurrentSQL,
  isConnected,
  onRunQuery,
  schema,
}: CenterTopPanelProps): React.JSX.Element {
  return (
    <>
      <div className="h-10 border-b flex justify-between items-center px-4 bg-muted/20">
        <span className="font-medium text-xs text-muted-foreground">QUERY EDITOR</span>
        <Button size="sm" className="h-7 text-xs" onClick={onRunQuery} disabled={!isConnected}>
          Run Query (Cmd+Enter)
        </Button>
      </div>
      <div className="flex-1">
        <Editor
          value={currentSQL}
          onChange={(val) => setCurrentSQL(val || '')}
          onExecute={onRunQuery}
          schema={schema}
        />
      </div>
    </>
  );
}
