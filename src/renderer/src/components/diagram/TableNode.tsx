import { SchemaTable } from '@common/db/types';
import { Table } from '@renderer/shadcn/ui/table';
import { Handle, Position } from '@xyflow/react';
import { KeyRound, LinkIcon } from 'lucide-react';

export const TableNode = ({ data }: { data: SchemaTable }) => {
  return (
    <div className="border rounded-md bg-card text-card-foreground shadow-sm w-65 text-xs transition-colors overflow-hidden">
      <div className="bg-muted p-2 font-medium flex items-center gap-2">
        <Table className="size-3.5" />
        <span className="truncate">{data.tableName}</span>
      </div>
      <div>
        {data.columns.map((col) => (
          <div
            key={col.name}
            className="flex items-center gap-2 p-2 hover:bg-muted/50 relative group"
          >
            <Handle
              type="target"
              position={Position.Left}
              id={`${col.name}-left`}
              className="w-2 h-2 opacity-0"
              style={{ top: '50%' }}
            />
            <div className="size-3.5 flex items-center justify-center shrink-0">
              {col.isPrimaryKey && <KeyRound className="size-3 text-yellow-500" />}
              {col.isForeignKey && <LinkIcon className="size-3 text-blue-500" />}
            </div>
            <span className="truncate flex-1">{col.name}</span>
            <span className="text-[10px] text-muted-foreground">{col.type}</span>
            <Handle
              type="source"
              position={Position.Right}
              id={`${col.name}-right`}
              className="w-2 h-2 opacity-0"
              style={{ top: '50%' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
