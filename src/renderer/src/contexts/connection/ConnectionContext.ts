import { createContext, useContext } from 'react';
import { Connection } from 'src/types';

interface ConnectionContextValue {
  activeConnection: Connection | null;
  isConnected: boolean;
  setActiveConnection: React.Dispatch<React.SetStateAction<Connection | null>>;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  clearActiveConnection: () => void;
}

export const ConnectionContext = createContext<ConnectionContextValue | undefined>(undefined);

export function useConnection(): ConnectionContextValue {
  const context = useContext(ConnectionContext);

  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }

  return context;
}
