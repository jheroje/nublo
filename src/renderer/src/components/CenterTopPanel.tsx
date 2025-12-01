import { Editor } from '@renderer/components/editor/SQLEditor';
import { useConnection } from '@renderer/contexts/connection/ConnectionContext';
import { useTabs } from '@renderer/contexts/tabs/TabsContext';
import { Button } from '@renderer/shadcn/ui/button';
import React from 'react';
import { Schema } from 'src/types';

type CenterTopPanelProps = {
  schema: Schema;
};

export function CenterTopPanel({ schema }: CenterTopPanelProps): React.JSX.Element {
  const { activeConnection, isConnected } = useConnection();
  const { activeTab, activeTabId, updateTabState } = useTabs();

  const { editorSQL } = activeTab;

  const onRunQuery = async (): Promise<void> => {
    if (!isConnected || !activeConnection) return;

    updateTabState(activeTabId, { queryError: '' });

    try {
      const queryResult = await window.api.db.runQuery(
        activeConnection.connectionString,
        editorSQL
      );
      updateTabState(activeTabId, { queryResult });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      updateTabState(activeTabId, { queryError: `Query failed: ${errorMessage}` });
    }
  };

  return (
    <>
      <div className="h-10 flex justify-between items-center px-4 bg-background">
        <span className="font-medium text-xs text-muted-foreground">QUERY EDITOR</span>
        <Button size="sm" className="h-7 text-xs" onClick={onRunQuery} disabled={!isConnected}>
          Run Query (Cmd+Enter)
        </Button>
      </div>
      <div className="flex-1">
        <Editor
          value={editorSQL}
          onChange={(val) => updateTabState(activeTabId, { editorSQL: val || '' })}
          onExecute={onRunQuery}
          schema={schema}
        />
      </div>
    </>
  );
}
