import Shell from '@renderer/components/Shell';
import { ConnectionProvider } from '@renderer/contexts/connection/ConnectionProvider';
import { TabsProvider } from '@renderer/contexts/tabs/TabsProvider';
import React from 'react';

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
