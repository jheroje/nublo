import { CenterBottomPanel } from '@renderer/components/CenterBottomPanel';
import { CenterTopPanel } from '@renderer/components/CenterTopPanel';
import { LeftPanel } from '@renderer/components/LeftPanel';
import { RightPanel } from '@renderer/components/RightPanel';
import { StatusBar } from '@renderer/components/StatusBar';
import { useTabs } from '@renderer/contexts/tabs/TabsContext';
import { Button } from '@renderer/shadcn/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@renderer/shadcn/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/shadcn/ui/tabs';
import { Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import { Schema } from 'src/types';

export default function Shell(): React.JSX.Element {
  const [schema, setSchema] = useState<Schema>([]);
  const [connectionError, setConnectionError] = useState('');

  const { tabs, activeTabId, setActiveTab, addTab, removeTab } = useTabs();

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

        {/* Center & Right Panels (Tabbed) */}
        <ResizablePanel defaultSize={80}>
          <Tabs
            value={activeTabId}
            onValueChange={setActiveTab}
            className="h-full flex flex-col w-full gap-0"
          >
            <div className="bg-muted/10 border-b flex items-center justify-start">
              <TabsList className="h-9 bg-transparent p-0 justify-start overflow-x-auto no-scrollbar rounded-b-none">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="h-9 relative group min-w-[120px] border-none rounded-b-none"
                  >
                    <span className="mr-2 truncate max-w-[100px]">{tab.title}</span>
                    {tabs.length > 1 && (
                      <div
                        role="button"
                        className="opacity-0 group-hover:opacity-100 hover:bg-muted rounded-full p-0.5 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTab(tab.id);
                        }}
                      >
                        <X size={12} />
                      </div>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button
                size="icon"
                variant="ghost"
                onClick={addTab}
                className="h-8 w-8 ml-2 shrink-0 mr-4"
              >
                <Plus size={16} />
              </Button>
            </div>

            <TabsContent
              value={activeTabId}
              className="flex-1 h-full mt-0 border-0 p-0 data-[state=active]:flex flex-col"
            >
              <ResizablePanelGroup direction="horizontal" className="h-full flex-1">
                {/* Center Panel: Editor & Results */}
                <ResizablePanel defaultSize={65}>
                  <ResizablePanelGroup direction="vertical">
                    {/* Top: Editor */}
                    <ResizablePanel defaultSize={60} className="border-b flex flex-col">
                      <CenterTopPanel schema={schema} />
                    </ResizablePanel>

                    <ResizableHandle />

                    {/* Bottom: Results */}
                    <ResizablePanel defaultSize={40} className="flex flex-col bg-background">
                      <CenterBottomPanel />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>

                <ResizableHandle />

                {/* Right Panel: AI Chat */}
                <ResizablePanel
                  defaultSize={35}
                  minSize={35}
                  className="border-l bg-muted/5 flex flex-col"
                >
                  <RightPanel schema={schema} />
                </ResizablePanel>
              </ResizablePanelGroup>
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}
