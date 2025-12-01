import Shell from '@renderer/components/Shell';
import React from 'react';
import { ConnectionProvider } from './contexts/connection/ConnectionProvider';
import { TabsProvider } from './contexts/tabs/TabsProvider';

function App(): React.JSX.Element {
  return (
    <ConnectionProvider>
      <TabsProvider>
        <Shell />
      </TabsProvider>
    </ConnectionProvider>
  );
}

export default App;
