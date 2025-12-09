import { useConnection } from '@renderer/contexts/connection/ConnectionContext';
import { Button } from '@renderer/shadcn/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import React from 'react';
import { Connection } from '../../../../../common/db/types';

type ConnectionItemProps = {
  connection: Connection;
  onEdit: (connection: Connection) => void;
};

export function ConnectionItem({ connection, onEdit }: ConnectionItemProps): React.JSX.Element {
  const {
    activeConnection,
    setActiveConnection,
    setIsConnected,
    setSchema,
    deleteConnection,
    setConnectionError,
  } = useConnection();

  const onConnect = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();

    try {
      await window.api.db.testConnection(connection.connectionString);
      setIsConnected(true);
      setActiveConnection(connection);
      setConnectionError('');

      const schemaRes = await window.api.db.getSchema(connection.connectionString);
      setSchema(schemaRes);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setConnectionError(
        `Error connecting to ${connection.name}: ${errorMessage || 'Unknown error'}`
      );
      setActiveConnection(null);
      setIsConnected(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this connection?')) {
      deleteConnection(connection.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(connection);
  };

  return (
    <div
      className={`group flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer transition-colors ${activeConnection?.id === connection.id ? 'bg-muted/30' : ''}`}
      onClick={onConnect}
    >
      <div className={`w-3 h-3 mx-1 rounded-full bg-${connection.color}`} />
      <span className="text-xs font-medium truncate flex-1">{connection.name}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={handleEdit}
        >
          <Edit2 className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground hover:text-red-500 cursor-pointer"
          onClick={handleDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
