import Shell from '@renderer/components/Shell';
import { ConnectionProvider } from '@renderer/contexts/connection/ConnectionProvider';
import { SettingsProvider } from '@renderer/contexts/settings/SettingsProvider';
import { TabsProvider } from '@renderer/contexts/tabs/TabsProvider';
import React from 'react';

function App(): React.JSX.Element {
  return (
    <SettingsProvider>
      <ConnectionProvider>
        <TabsProvider>
          <Shell />
        </TabsProvider>
      </ConnectionProvider>
    </SettingsProvider>
  );
}

export default App;
