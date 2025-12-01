import { Editor } from '@renderer/components/editor/SQLEditor';
import { useConnection } from '@renderer/contexts/connection/ConnectionContext';
import { Button } from '@renderer/shadcn/ui/button';
import React from 'react';
import { QueryResult, Schema } from 'src/types';

interface CenterTopPanelProps {
  schema: Schema;
  currentSQL: string;
  setCurrentSQL: React.Dispatch<React.SetStateAction<string>>;
  setQueryError: React.Dispatch<React.SetStateAction<string>>;
  setQueryResult: React.Dispatch<React.SetStateAction<QueryResult | null>>;
}

export function CenterTopPanel({
  schema,
  currentSQL,
  setCurrentSQL,
  setQueryError,
  setQueryResult,
}: CenterTopPanelProps): React.JSX.Element {
  const { activeConnection, isConnected } = useConnection();

  const onRunQuery = async (): Promise<void> => {
    if (!isConnected || !activeConnection) return;

    setQueryError('');

    try {
      const res = await window.api.db.runQuery(activeConnection.connectionString, currentSQL);
      setQueryResult(res);
    } catch (error) {
      setQueryError('Query failed: ' + (error instanceof Error ? error.message : error));
    }
  };

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
