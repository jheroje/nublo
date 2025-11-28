import { Button } from '@renderer/shadcn/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@renderer/shadcn/ui/collapsible';
import { Input } from '@renderer/shadcn/ui/input';
import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { SchemaResult } from '../../../types';

interface LeftPanelProps {
  connectionString: string;
  setConnectionString: (value: string) => void;
  isConnected: boolean;
  connectionError: string;
  schema: SchemaResult;
  onConnect: () => void;
}

export function LeftPanel({
  connectionString,
  setConnectionString,
  isConnected,
  connectionError,
  schema,
  onConnect,
}: LeftPanelProps): React.JSX.Element {
  const [openTables, setOpenTables] = useState<Set<string>>(new Set());

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
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase">Connection</label>
          <Input
            placeholder="postgresql://..."
            value={connectionString}
            onChange={(e) => setConnectionString(e.target.value)}
            className="mt-1 h-8 text-xs"
          />
        </div>
        <Button onClick={onConnect} className="w-full h-8 text-xs" disabled={isConnected}>
          {isConnected ? 'Connected' : 'Connect'}
        </Button>

        {connectionError && <p className="text-red-500 text-xs">{connectionError}</p>}

        {isConnected && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2 text-xs uppercase text-muted-foreground">Schema</h3>
            <div className="h-[calc(100vh-250px)] overflow-y-auto text-xs space-y-1">
              {schema.map((table) => (
                <Collapsible
                  key={table.table_name}
                  open={openTables.has(table.table_name)}
                  onOpenChange={() => toggleTable(table.table_name)}
                >
                  <CollapsibleTrigger className="w-full flex items-center gap-1 hover:bg-muted/50 rounded px-2 py-1.5 transition-colors">
                    <ChevronRight
                      className={`h-3 w-3 transition-transform ${
                        openTables.has(table.table_name) ? 'rotate-90' : ''
                      }`}
                    />
                    <span className="text-blue-500">#</span>
                    <span className="font-medium text-foreground">{table.table_name}</span>
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
