import { QueryRow } from '@common/types';
import { useTabs } from '@renderer/contexts/tabs/TabsContext';
import { ScrollArea, ScrollBar } from '@renderer/shadcn/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@renderer/shadcn/ui/table';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React, { useMemo } from 'react';

export function CenterBottomPanel(): React.JSX.Element {
  const { activeTab } = useTabs();
  const { queryError, queryResult } = activeTab;

  const data = useMemo(() => queryResult?.rows || [], [queryResult?.rows]);

  const columns = useMemo(() => {
    if (!queryResult?.columns) return [];

    const columnHelper = createColumnHelper<QueryRow>();

    return queryResult.columns.map((col, index) =>
      columnHelper.accessor((row) => row.values[index], {
        id: col.__columnId,
        header: col.name,
        cell: (info) =>
          typeof info.getValue() === 'object'
            ? JSON.stringify(info.getValue())
            : String(info.getValue()),
        enableResizing: true,
      })
    );
  }, [queryResult?.columns]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
  });

  return (
    <>
      <div className="h-10 flex items-center px-4 bg-background">
        <span className="font-medium text-xs text-muted-foreground">QUERY RESULTS</span>
      </div>
      <div className="flex-1 overflow-hidden">
        {queryError ? (
          <div className="flex items-center justify-center h-full text-red-500 text-sm p-4">
            {queryError}
          </div>
        ) : queryResult ? (
          <ScrollArea className="h-full w-full">
            <div className="w-max min-w-full">
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          style={{ width: header.getSize() }}
                          className="font-medium text-xs text-muted-foreground relative"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}

                          {header.column.getCanResize() && (
                            <div
                              onMouseDown={header.getResizeHandler()}
                              className="absolute -right-1 top-0 h-full w-2 cursor-col-resize select-none z-100"
                            />
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{ width: cell.column.getSize() }}
                          className="border-r last:border-r-0 text-xs"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <ScrollBar orientation="vertical" />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Run a query to see results
          </div>
        )}
      </div>
    </>
  );
}
