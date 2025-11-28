import React from 'react';
import { QueryResult } from '../../../types';

interface CenterBottomPanelProps {
  queryResult: QueryResult | null;
}

export function CenterBottomPanel({ queryResult }: CenterBottomPanelProps): React.JSX.Element {
  return (
    <>
      <div className="h-10 border-b flex items-center px-4 bg-muted/20">
        <span className="font-medium text-xs text-muted-foreground">QUERY RESULTS</span>
      </div>
      <div className="flex-1 overflow-auto">
        {queryResult ? (
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                {queryResult.columns.map((col) => (
                  <th
                    key={col}
                    className="p-2 border-b font-medium text-xs text-muted-foreground whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queryResult.rows.map((row, i) => (
                <tr key={i} className="hover:bg-muted/50 border-b last:border-0">
                  {queryResult.columns.map((col) => (
                    <td
                      key={col}
                      className="p-2 border-r last:border-r-0 whitespace-nowrap max-w-[200px] truncate"
                    >
                      {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Run a query to see results
          </div>
        )}
      </div>
    </>
  );
}
