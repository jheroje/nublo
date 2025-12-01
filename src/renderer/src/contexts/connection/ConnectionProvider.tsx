import React, { ReactNode, useState } from 'react';
import { Connection, ConnectionContext } from './ConnectionContext';

type ConnectionProviderProps = {
  children: ReactNode;
};

export function ConnectionProvider({ children }: ConnectionProviderProps): React.JSX.Element {
  const [activeConnection, setActiveConnection] = useState<Connection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const clearActiveConnection = () => {
    setActiveConnection(null);
  };

  return (
    <ConnectionContext.Provider
      value={{
        activeConnection,
        isConnected,
        setActiveConnection,
        setIsConnected,
        clearActiveConnection,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}
