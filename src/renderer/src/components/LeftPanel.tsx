import { Schema } from '@common/types';
import { SavedConnections } from '@renderer/components/SavedConnections';
import { useConnection } from '@renderer/contexts/connection/ConnectionContext';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@renderer/shadcn/ui/collapsible';
import { ChevronRight, Table } from 'lucide-react';
import React, { useState } from 'react';

type LeftPanelProps = {
  schema: Schema;
  setSchema: React.Dispatch<React.SetStateAction<Schema>>;
  connectionError: string;
  setConnectionError: React.Dispatch<React.SetStateAction<string>>;
};

export function LeftPanel({
  schema,
  setSchema,
  connectionError,
  setConnectionError,
}: LeftPanelProps): React.JSX.Element {
  const [openTables, setOpenTables] = useState<Set<string>>(new Set());

  const { isConnected, setIsConnected, activeConnection } = useConnection();

  const onConnect = async (connectionString: string): Promise<void> => {
    if (!connectionString) return;

    setConnectionError('');

    try {
      await window.api.db.testConnection(connectionString);

      setIsConnected(true);

      const schemaRes = await window.api.db.getSchema(connectionString);
      setSchema(schemaRes);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      setConnectionError(errorMessage || 'Unknown error');
      setIsConnected(false);
    }
  };

  const toggleTable = (tableName: string) => {
    setOpenTables((prev) => {
      const next = new Set(prev);
      if (next.has(tableName)) {
        next.delete(tableName);
      } else {
        next.add(tableName);
      }
      return next;
    });
  };

  return (
    <>
      <div className="space-y-4">
        <SavedConnections onConnect={onConnect} />

        {connectionError && <p className="text-red-500 text-xs">{connectionError}</p>}

        {isConnected && activeConnection && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2 text-xs uppercase text-muted-foreground">Schema</h3>
            <div className="h-[calc(100vh-350px)] overflow-y-auto text-xs space-y-1">
              {schema.map((table) => (
                <Collapsible
                  key={table.tableName}
                  open={openTables.has(table.tableName)}
                  onOpenChange={() => toggleTable(table.tableName)}
                >
                  <CollapsibleTrigger className="w-full flex items-center gap-1 hover:bg-muted/50 rounded px-2 py-1.5 transition-colors">
                    <ChevronRight
                      className={`h-3 w-3 transition-transform ${
                        openTables.has(table.tableName) ? 'rotate-90' : ''
                      }`}
                    />
                    <Table className={`h-3 w-3 text-${activeConnection.color}`} />
                    <span className="font-medium text-foreground">{table.tableName}</span>
                    <span className="ml-auto text-muted-foreground text-xs">
                      {table.columns.length}
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6 mt-1">
                    <ul className="border-l ml-1 space-y-1">
                      {table.columns.map((col) => (
                        <li
                          key={col.name}
                          className="text-muted-foreground truncate pl-3 py-0.5"
                          title={`${col.name} (${col.type})`}
                        >
                          {col.name} <span className="opacity-50 text-xs">{col.type}</span>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
