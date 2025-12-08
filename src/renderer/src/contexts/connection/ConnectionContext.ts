import { Connection, Schema } from '@common/db/types';
import { createContext, useContext } from 'react';

type ConnectionContextValue = {
  activeConnection: Connection | null;
  savedConnections: Connection[];
  isConnected: boolean;
  connectionError: string;
  schema: Schema;
  setActiveConnection: React.Dispatch<React.SetStateAction<Connection | null>>;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  setConnectionError: React.Dispatch<React.SetStateAction<string>>;
  setSchema: React.Dispatch<React.SetStateAction<Schema>>;
  addConnection: (connection: Connection) => void;
  updateConnection: (connection: Connection) => void;
  deleteConnection: (id: string) => void;
  clearActiveConnection: () => void;
};

export const ConnectionContext = createContext<ConnectionContextValue | undefined>(undefined);

export function useConnection() {
  const context = useContext(ConnectionContext);

  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }

  return context;
}
