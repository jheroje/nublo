import { ResizableHandle, ResizablePanelGroup } from '@renderer/shadcn/ui/resizable';
import React from 'react';
import { ConnectionsSection } from './sidebar/ConnectionsSection';
import { SchemaSection } from './sidebar/SchemaSection';

export function LeftPanel(): React.JSX.Element {
  return (
    <ResizablePanelGroup direction="vertical" className="h-full">
      <ConnectionsSection />

      <ResizableHandle />

      <SchemaSection />
    </ResizablePanelGroup>
  );
}
