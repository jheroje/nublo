import Shell from '@renderer/components/Shell';
import React from 'react';
import { ConnectionProvider } from './contexts/connection/ConnectionProvider';

function App(): React.JSX.Element {
  return (
    <ConnectionProvider>
      <Shell />
    </ConnectionProvider>
  );
}

export default App;
