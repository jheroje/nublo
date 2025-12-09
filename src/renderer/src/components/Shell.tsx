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
import { SettingsDialog } from './SettingsDialog';
import TitleBar from './TitleBar';

export default function Shell(): React.JSX.Element {
  const [showSettings, setShowSettings] = useState(false);

  const { tabs, activeTabId, setActiveTab, addTab, removeTab } = useTabs();

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col">
      {/* Draggable title bar region for window dragging */}
      <TitleBar />

      {/* Core app */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        {/* Left Panel: Connections & Schema */}
        <ResizablePanel defaultSize={15} className="bg-muted/30 min-w-[300px]">
          <LeftPanel />
        </ResizablePanel>

        <ResizableHandle className="bg-muted/30" />

        {/* Center & Right Panels (Tabbed) */}
        <ResizablePanel defaultSize={85}>
          <Tabs
            value={activeTabId}
            onValueChange={setActiveTab}
            className="h-full flex flex-col w-full gap-0"
          >
            <div className="bg-muted/30 flex items-center justify-start">
              <TabsList className="h-9 bg-transparent p-0 justify-start overflow-x-auto no-scrollbar rounded-none">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="h-9 relative group min-w-[120px] border-none rounded-b-none dark:data-[state=active]:bg-background bg-muted/30 text-xs"
                  >
                    <span className="mr-2 truncate max-w-[100px]">{tab.title}</span>
                    {tabs.length > 1 && (
                      <Button
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 hover:bg-muted rounded-full transition-opacity size-6 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTab(tab.id);
                        }}
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button
                size="icon"
                variant="ghost"
                onClick={addTab}
                className="size-6 ml-2 shrink-0 mr-4 rounded-full cursor-pointer"
              >
                <Plus className="size-4" />
              </Button>
            </div>

            <TabsContent
              value={activeTabId}
              className="flex-1 h-full mt-0 border-0 p-0 data-[state=active]:flex flex-col"
            >
              <ResizablePanelGroup direction="horizontal" className="h-full flex-1">
                {/* Center Panel: Editor & Results */}
                <ResizablePanel defaultSize={70}>
                  <ResizablePanelGroup direction="vertical">
                    {/* Top: Editor */}
                    <ResizablePanel defaultSize={60} className="flex flex-col">
                      <CenterTopPanel />
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
                <ResizablePanel defaultSize={30} className="flex flex-col min-w-[280px]">
                  <RightPanel />
                </ResizablePanel>
              </ResizablePanelGroup>
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Status Bar */}
      <StatusBar setShowSettings={setShowSettings} />

      {/* Settings Dialog */}
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
}
