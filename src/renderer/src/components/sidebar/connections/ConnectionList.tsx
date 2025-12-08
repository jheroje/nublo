import { Connection } from '@common/db/types';
import { useConnection } from '@renderer/contexts/connection/ConnectionContext';
import React from 'react';
import { ConnectionItem } from './ConnectionItem';

type ConnectionListProps = {
  onEdit: (connection: Connection) => void;
};

export function ConnectionList({ onEdit }: ConnectionListProps): React.JSX.Element {
  const { savedConnections } = useConnection();

  if (savedConnections.length === 0) {
    return <p className="text-xs text-muted-foreground italic px-2">No saved connections</p>;
  }

  return (
    <div className="space-y-1">
      {savedConnections.map((conn) => (
        <ConnectionItem key={conn.id} connection={conn} onEdit={onEdit} />
      ))}
    </div>
  );
}
