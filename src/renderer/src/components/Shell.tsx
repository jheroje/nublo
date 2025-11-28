import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@renderer/components/ui/resizable';
import React, { useState } from 'react';
import { AIMessage, QueryResult, SchemaResult } from '../../../types';
import { CenterBottomPanel } from './CenterBottomPanel';
import { CenterTopPanel } from './CenterTopPanel';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';

export default function Shell(): React.JSX.Element {
  const [connectionString, setConnectionString] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [currentSQL, setCurrentSQL] = useState('SELECT * FROM users LIMIT 10;');
  const [schema, setSchema] = useState<SchemaResult>([]);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [connectionError, setConnectionError] = useState('');
  const [chatMessages, setChatMessages] = useState<AIMessage[]>([]);

  const handleConnect = async (): Promise<void> => {
    setConnectionError('');

    try {
      const status = await window.api.db.testConnection(connectionString);

      if (status.success) {
        setIsConnected(true);

        const schemaRes = await window.api.db.getSchema(connectionString);
        setSchema(schemaRes);
      } else {
        setConnectionError(status.message);
      }
    } catch (error: any) {
      setConnectionError(error.message || 'Unknown error');
    }
  };

  const handleRunQuery = async (): Promise<void> => {
    if (!isConnected) return;

    try {
      const res = await window.api.db.runQuery(connectionString, currentSQL);
      console.log('Query result:', res);
      setQueryResult(res);
    } catch (err) {
      console.error(err);
      alert('Query failed');
    }
  };

  const handleAiGenerate = async (): Promise<void> => {
    if (!aiPrompt.trim()) return;

    if (!schema.length) {
      alert('Please connect to a database first to load schema.');
      return;
    }

    const userMsg = aiPrompt;
    setChatMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setAiPrompt('');

    try {
      const sql = await window.api.ai.generateQuery(schema, userMsg);
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Here is a query for you:\n\`\`\`sql\n${sql}\n\`\`\`` },
      ]);
      setCurrentSQL(sql);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error generating the query.' },
      ]);
    }
  };

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col">
      {/* Draggable title bar region for window dragging */}
      <div className="h-8 w-full bg-muted/10 app-drag" />

      {/* Core app */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel: Connections & Schema */}
        <ResizablePanel
          defaultSize={20}
          minSize={20}
          maxSize={40}
          className="p-4 border-r bg-muted/10"
        >
          <LeftPanel
            connectionString={connectionString}
            setConnectionString={setConnectionString}
            isConnected={isConnected}
            connectionError={connectionError}
            schema={schema}
            onConnect={handleConnect}
          />
        </ResizablePanel>

        <ResizableHandle />

        {/* Center Panel: Editor & Results */}
        <ResizablePanel defaultSize={60}>
          <ResizablePanelGroup direction="vertical">
            {/* Top: Editor */}
            <ResizablePanel defaultSize={60} className="border-b flex flex-col">
              <CenterTopPanel
                currentSQL={currentSQL}
                setCurrentSQL={setCurrentSQL}
                isConnected={isConnected}
                onRunQuery={handleRunQuery}
              />
            </ResizablePanel>

            <ResizableHandle />

            {/* Bottom: Results */}
            <ResizablePanel defaultSize={40} className="flex flex-col bg-background">
              <CenterBottomPanel queryResult={queryResult} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Panel: AI Chat */}
        <ResizablePanel defaultSize={20} minSize={20} className="border-l bg-muted/5 flex flex-col">
          <RightPanel
            chatMessages={chatMessages}
            aiPrompt={aiPrompt}
            setAiPrompt={setAiPrompt}
            isConnected={isConnected}
            onAiGenerate={handleAiGenerate}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
