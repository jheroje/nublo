import { Connection, Schema } from '@common/types';
import React, { ReactNode, useEffect, useState } from 'react';
import { ConnectionContext } from './ConnectionContext';

type ConnectionProviderProps = {
  children: ReactNode;
};

export function ConnectionProvider({ children }: ConnectionProviderProps): React.JSX.Element {
  const [activeConnection, setActiveConnection] = useState<Connection | null>(null);
  const [savedConnections, setSavedConnections] = useState<Connection[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [schema, setSchema] = useState<Schema>([]);

  useEffect(() => {
    const loadConnections = async () => {
      const saved = await window.api.store.get('saved_connections');
      if (saved) {
        setSavedConnections(saved);
      }
    };
    loadConnections();
  }, []);

  const saveConnectionsToStore = async (connections: Connection[]) => {
    setSavedConnections(connections);
    await window.api.store.set('saved_connections', connections);
  };

  const addConnection = (connection: Connection) => {
    const newConnections = [...savedConnections, connection];
    saveConnectionsToStore(newConnections);
  };

  const updateConnection = (connection: Connection) => {
    const newConnections = savedConnections.map((c) => (c.id === connection.id ? connection : c));
    saveConnectionsToStore(newConnections);

    if (activeConnection?.id === connection.id) {
      setActiveConnection(connection);
    }
  };

  const deleteConnection = (id: string) => {
    const newConnections = savedConnections.filter((c) => c.id !== id);
    saveConnectionsToStore(newConnections);

    if (activeConnection?.id === id) {
      setActiveConnection(null);
      setIsConnected(false);
      setSchema([]);
    }
  };

  const clearActiveConnection = () => {
    setActiveConnection(null);
  };

  return (
    <ConnectionContext.Provider
      value={{
        activeConnection,
        savedConnections,
        isConnected,
        connectionError,
        schema,
        setActiveConnection,
        setIsConnected,
        setConnectionError,
        setSchema,
        addConnection,
        updateConnection,
        deleteConnection,
        clearActiveConnection,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}
