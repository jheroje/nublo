import { createContext, useContext } from 'react';

export type Connection = {
  id: string;
  name: string;
  connectionString: string;
  color: string;
};

type ConnectionContextValue = {
  activeConnection: Connection | null;
  isConnected: boolean;
  setActiveConnection: React.Dispatch<React.SetStateAction<Connection | null>>;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
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
