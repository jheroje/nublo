import { useConnection } from '@renderer/contexts/connection/ConnectionContext';
import { Button } from '@renderer/shadcn/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@renderer/shadcn/ui/collapsible';
import { ChevronDown, ChevronRight, CopyMinus, Table } from 'lucide-react';
import React, { useState } from 'react';
import { CollapsibleResizablePanel } from './CollapsibleResizablePanel';

export function SchemaSection(): React.JSX.Element {
  const [openTables, setOpenTables] = useState<Set<string>>(new Set());

  const { isConnected, activeConnection, schema, connectionError } = useConnection();

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

  const collapseAllTables = () => {
    setOpenTables(new Set());
  };

  return (
    <CollapsibleResizablePanel
      title="Schema"
      defaultSize={65}
      minSize={10}
      collapsedSize={5}
      actions={
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 cursor-pointer"
          title="Collapse All"
          onClick={() => {
            collapseAllTables();
          }}
        >
          <CopyMinus className="size-4" />
        </Button>
      }
    >
      <div className="text-xs space-y-1 px-2">
        {connectionError && <p className="text-red-500 text-xs m-2">{connectionError}</p>}

        {isConnected &&
          activeConnection &&
          schema.map((table) => (
            <Collapsible
              key={table.tableName}
              open={openTables.has(table.tableName)}
              onOpenChange={() => toggleTable(table.tableName)}
            >
              <CollapsibleTrigger className="w-full flex items-center gap-2 hover:bg-muted/50 rounded px-2 py-1.5 transition-colors cursor-pointer">
                {openTables.has(table.tableName) ? (
                  <ChevronDown className="size-3 transition-transform" />
                ) : (
                  <ChevronRight className="size-3 transition-transform" />
                )}

                <Table className={`size-3 text-${activeConnection.color}`} />
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
    </CollapsibleResizablePanel>
  );
}
