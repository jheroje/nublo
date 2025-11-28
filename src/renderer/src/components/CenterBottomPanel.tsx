import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import React from 'react';
import { QueryResult } from '../../../types';

interface CenterBottomPanelProps {
  queryResult: QueryResult | null;
  queryError: string;
}

export function CenterBottomPanel({
  queryResult,
  queryError,
}: CenterBottomPanelProps): React.JSX.Element {
  return (
    <>
      <div className="h-10 border-b flex items-center px-4 bg-muted/20">
        <span className="font-medium text-xs text-muted-foreground">QUERY RESULTS</span>
      </div>
      <div className="flex-1 overflow-auto">
        {queryError ? (
          <div className="flex items-center justify-center h-full text-red-500 text-sm">
            {queryError}
          </div>
        ) : queryResult ? (
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              <TableRow>
                {queryResult.columns.map((col) => (
                  <TableHead key={col} className="font-medium text-xs text-muted-foreground">
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {queryResult.rows.map((row, i) => (
                <TableRow key={i}>
                  {queryResult.columns.map((col) => (
                    <TableCell
                      key={col}
                      className="border-r last:border-r-0 max-w-[200px] truncate"
                    >
                      {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Run a query to see results
          </div>
        )}
      </div>
    </>
  );
}
