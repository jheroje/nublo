import { useConnection } from '@renderer/contexts/connection/ConnectionContext';
import { useTabs } from '@renderer/contexts/tabs/TabsContext';
import { Button } from '@renderer/shadcn/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@renderer/shadcn/ui/collapsible';
import { ChevronDown, ChevronRight, CopyMinus, Eye, KeyRound, Link, Table } from 'lucide-react';
import React, { useState } from 'react';
import { CollapsibleResizablePanel } from './CollapsibleResizablePanel';

export function SchemaSection(): React.JSX.Element {
  const [openTables, setOpenTables] = useState<Set<string>>(new Set());
  const { addSchemaTab } = useTabs();

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

  const schemaActions =
    isConnected && activeConnection
      ? [
          <Button
            key="view-schema"
            variant="ghost"
            size="icon"
            className="h-6 w-6 cursor-pointer"
            title="View Schema"
            onClick={() => {
              addSchemaTab();
            }}
          >
            <Eye className="size-4" />
          </Button>,
          <Button
            key="collapse-all"
            variant="ghost"
            size="icon"
            className="h-6 w-6 cursor-pointer"
            title="Collapse All"
            onClick={() => {
              collapseAllTables();
            }}
          >
            <CopyMinus className="size-4" />
          </Button>,
        ]
      : [];

  return (
    <CollapsibleResizablePanel
      title="Schema"
      defaultSize={65}
      minSize={10}
      collapsedSize={5}
      actions={schemaActions}
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
                    <li key={col.name} className="text-muted-foreground truncate pl-3 py-0.5">
                      <div className="flex items-center gap-1.5">
                        <span>{col.name}</span>
                        <span className="opacity-50 text-xs truncate">{col.type}</span>
                        {col.isPrimaryKey && <KeyRound className="size-2.5 text-yellow-500" />}
                        {col.isForeignKey && <Link className="size-2.5 text-blue-500" />}
                      </div>
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
