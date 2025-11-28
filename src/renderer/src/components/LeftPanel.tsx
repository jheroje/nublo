import { Button } from '@renderer/components/ui/button';
import { Input } from '@renderer/components/ui/input';
import React from 'react';
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
            <div className="h-[calc(100vh-250px)] overflow-y-auto text-xs">
              {schema.map((table) => (
                <div key={table.table_name} className="mb-3">
                  <div className="font-medium text-foreground flex items-center gap-1">
                    <span className="text-blue-500">#</span> {table.table_name}
                  </div>
                  <ul className="pl-3 border-l ml-1 mt-1 space-y-1">
                    {table.columns.map((col) => (
                      <li
                        key={col.name}
                        className="text-muted-foreground truncate"
                        title={`${col.name} (${col.type})`}
                      >
                        {col.name} <span className="opacity-50 text-[10px]">{col.type}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
