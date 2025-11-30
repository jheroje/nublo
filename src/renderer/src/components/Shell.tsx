import { CenterBottomPanel } from '@renderer/components/CenterBottomPanel';
import { CenterTopPanel } from '@renderer/components/CenterTopPanel';
import { LeftPanel } from '@renderer/components/LeftPanel';
import { RightPanel } from '@renderer/components/RightPanel';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@renderer/shadcn/ui/resizable';
import React, { useState } from 'react';
import { AIMessage, QueryResult, SchemaResult } from '../../../types';

export default function Shell(): React.JSX.Element {
  const [connectionString, setConnectionString] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [currentSQL, setCurrentSQL] = useState('SELECT * FROM users LIMIT 10;');
  const [schema, setSchema] = useState<SchemaResult>([]);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [connectionError, setConnectionError] = useState('');
  const [chatMessages, setChatMessages] = useState<AIMessage[]>([]);
  const [selectedModel, setSelectedModel] = useState('google/gemini-2.0-flash-exp:free');

  const handleConnect = async (connStr?: string): Promise<void> => {
    setConnectionError('');

    const targetConnectionString = typeof connStr === 'string' ? connStr : connectionString;
    if (typeof connStr === 'string') {
      setConnectionString(connStr);
    }

    try {
      const status = await window.api.db.testConnection(targetConnectionString);

      if (status.success) {
        setIsConnected(true);

        const schemaRes = await window.api.db.getSchema(targetConnectionString);
        setSchema(schemaRes);
      } else {
        setConnectionError(status.message);
      }
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleRunQuery = async (): Promise<void> => {
    if (!isConnected) return;

    setQueryError('');

    try {
      const res = await window.api.db.runQuery(connectionString, currentSQL);
      setQueryResult(res);
    } catch (error) {
      setQueryError('Query failed: ' + (error instanceof Error ? error.message : error));
    }
  };

  const handleAiGenerate = (): void => {
    if (!aiPrompt.trim()) return;

    if (!schema.length) {
      alert('Please connect to a database first to load schema.');
      return;
    }

    const userMsg = aiPrompt;
    setChatMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setAiPrompt('');
    setChatMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    let fullResponse = '';

    window.api.ai.streamQuery(
      schema,
      userMsg,
      selectedModel,
      (chunk) => {
        fullResponse += chunk;
        setChatMessages((prev) => {
          const newMsgs = [...prev];
          const lastMsg = newMsgs[newMsgs.length - 1];
          if (lastMsg.role === 'assistant') {
            lastMsg.content = `Generating SQL:\n\`\`\`json\n${fullResponse}\n\`\`\``;
          }
          return newMsgs;
        });
      },
      () => {
        setChatMessages((prev) => {
          const newMsgs = [...prev];
          const lastMsg = newMsgs[newMsgs.length - 1];
          if (lastMsg.role === 'assistant') {
            lastMsg.content = 'Finished streaming. Validating and parsing result...';
          }
          return newMsgs;
        });
      },
      (error) => {
        setChatMessages((prev) => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: `⚠️ Stream/Parsing Error: ${error}` },
        ]);
      },
      (finalSql) => {
        setChatMessages((prev) => {
          const newMsgs = [...prev];
          const lastMsg = newMsgs[newMsgs.length - 1];
          lastMsg.content = `Here is the generated query:\n\`\`\`sql\n${finalSql}\n\`\`\``;
          return newMsgs;
        });

        setCurrentSQL(finalSql);
      }
    );
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
        <ResizablePanel defaultSize={50}>
          <ResizablePanelGroup direction="vertical">
            {/* Top: Editor */}
            <ResizablePanel defaultSize={60} className="border-b flex flex-col">
              <CenterTopPanel
                currentSQL={currentSQL}
                setCurrentSQL={setCurrentSQL}
                isConnected={isConnected}
                onRunQuery={handleRunQuery}
                schema={schema}
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
          <RightPanel
            chatMessages={chatMessages}
            aiPrompt={aiPrompt}
            setAiPrompt={setAiPrompt}
            isConnected={isConnected}
            onAiGenerate={handleAiGenerate}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
