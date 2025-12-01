import { CenterBottomPanel } from '@renderer/components/CenterBottomPanel';
import { CenterTopPanel } from '@renderer/components/CenterTopPanel';
import { LeftPanel } from '@renderer/components/LeftPanel';
import { RightPanel } from '@renderer/components/RightPanel';
import { StatusBar } from '@renderer/components/StatusBar';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@renderer/shadcn/ui/resizable';
import React, { useState } from 'react';
import { QueryResult, Schema } from 'src/types';

export default function Shell(): React.JSX.Element {
  const [schema, setSchema] = useState<Schema>([]);
  const [currentSQL, setCurrentSQL] = useState('SELECT * FROM users LIMIT 10;');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState('');
  const [connectionError, setConnectionError] = useState('');

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col">
      {/* Draggable title bar region for window dragging */}
      <div className="h-8 w-full bg-muted/10 app-drag" />

      {/* Core app */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        {/* Left Panel: Connections & Schema */}
        <ResizablePanel
          defaultSize={20}
          minSize={20}
          maxSize={40}
          className="p-4 border-r bg-muted/10"
        >
          <LeftPanel
            schema={schema}
            setSchema={setSchema}
            connectionError={connectionError}
            setConnectionError={setConnectionError}
          />
        </ResizablePanel>

        <ResizableHandle />

        {/* Center Panel: Editor & Results */}
        <ResizablePanel defaultSize={50}>
          <ResizablePanelGroup direction="vertical">
            {/* Top: Editor */}
            <ResizablePanel defaultSize={60} className="border-b flex flex-col">
              <CenterTopPanel
                schema={schema}
                currentSQL={currentSQL}
                setCurrentSQL={setCurrentSQL}
                setQueryError={setQueryError}
                setQueryResult={setQueryResult}
              />
            </ResizablePanel>

            <ResizableHandle />

            {/* Bottom: Results */}
            <ResizablePanel defaultSize={40} className="flex flex-col bg-background">
              <CenterBottomPanel queryResult={queryResult} queryError={queryError} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Panel: AI Chat */}
        <ResizablePanel defaultSize={30} minSize={30} className="border-l bg-muted/5 flex flex-col">
          <RightPanel schema={schema} setCurrentSQL={setCurrentSQL} />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}
