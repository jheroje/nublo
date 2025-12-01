import { SavedConnections } from '@renderer/components/SavedConnections';
import { useConnection } from '@renderer/contexts/connection/ConnectionContext';
import { Button } from '@renderer/shadcn/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@renderer/shadcn/ui/collapsible';
import { Input } from '@renderer/shadcn/ui/input';
import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { Schema } from 'src/types';

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

  const { activeConnection, setActiveConnection, isConnected, setIsConnected } = useConnection();

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
      <h2 className="text-lg font-bold mb-4">Nublo</h2>
      <div className="space-y-4">
        <SavedConnections onConnect={onConnect} />

        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase">
            New Connection
          </label>
          <Input
            placeholder="postgresql://..."
            value={activeConnection?.connectionString ?? ''}
            onChange={(e) =>
              setActiveConnection((prev) =>
                prev
                  ? { ...prev, connectionString: e.target.value }
                  : {
                      id: '',
                      name: 'Custom Connection',
                      color: 'bg-gray-500',
                      connectionString: e.target.value,
                    }
              )
            }
            className="mt-1 h-8 text-xs"
          />
        </div>
        <Button
          onClick={() => onConnect(activeConnection?.connectionString ?? '')}
          className="w-full h-8 text-xs"
          disabled={isConnected}
        >
          {isConnected ? 'Connected' : 'Connect'}
        </Button>

        {connectionError && <p className="text-red-500 text-xs">{connectionError}</p>}

        {isConnected && (
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
                    <span className="text-blue-500">#</span>
                    <span className="font-medium text-foreground">{table.tableName}</span>
                    <span className="ml-auto text-muted-foreground text-[10px]">
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
                          {col.name} <span className="opacity-50 text-[10px]">{col.type}</span>
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
