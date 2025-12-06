import { AIProvider } from '@common/types';
import { useConnection } from '@renderer/contexts/connection/ConnectionContext';
import { useSettings } from '@renderer/contexts/settings/SettingsContext';
import { useTabs } from '@renderer/contexts/tabs/TabsContext';
import { Button } from '@renderer/shadcn/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@renderer/shadcn/ui/select';
import { Textarea } from '@renderer/shadcn/ui/textarea';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

export function RightPanel(): React.JSX.Element {
  const { aiSettings } = useSettings();
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const { isConnected, schema } = useConnection();
  const { activeTab, activeTabId, updateTabState, appendMessage, updateLastMessage } = useTabs();

  const { chatPrompt, selectedModel, chatMessages } = activeTab;

  const isButtonDisabled = !isConnected || !chatPrompt.trim() || isAiGenerating;

  const onAiGenerate = async (): Promise<void> => {
    if (!chatPrompt.trim() || isAiGenerating) return;

    if (!schema.length) {
      alert('Please connect to a database first to load schema.');
      return;
    }

    updateTabState(activeTabId, { chatPrompt: '' });
    appendMessage(activeTabId, { role: 'user', content: chatPrompt });
    appendMessage(activeTabId, { role: 'assistant', content: 'Generating query...' });

    setIsAiGenerating(true);

    try {
      const handleStatus = (status: string) => {
        updateLastMessage(activeTabId, { content: `**Status:** *${status}*` });
      };

      const sqlResult = await window.api.ai.generateQuery(
        schema,
        chatPrompt,
        selectedModel,
        handleStatus
      );

      updateLastMessage(activeTabId, {
        role: 'assistant',
        content: `Here is the generated query:\n\`\`\`sql\n${sqlResult}\n\`\`\``,
      });

      updateTabState(activeTabId, { editorSQL: sqlResult });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      updateLastMessage(activeTabId, {
        role: 'assistant',
        content: `**Error Generating Query:** ${errorMessage}`,
      });
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <>
      <div className="h-10 flex items-center justify-between px-4 bg-background">
        <span className="font-medium text-xs text-muted-foreground">AI ASSISTANT</span>
        <Select
          value={selectedModel}
          onValueChange={(model) => updateTabState(activeTabId, { selectedModel: model })}
        >
          <SelectTrigger size="sm" className="text-xs">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent className="text-xs">
            {aiSettings?.providers[AIProvider.OPENROUTER] && (
              <SelectGroup>
                <SelectLabel>OpenRouter</SelectLabel>
                <SelectItem value="openai/gpt-oss-20b:free">GPT OSS 20B</SelectItem>
                <SelectItem value="google/gemini-2.0-flash-exp:free">Gemini 2.0 Flash</SelectItem>
                <SelectItem value="meta-llama/llama-3.2-3b-instruct:free">Llama 3.2 3B</SelectItem>
              </SelectGroup>
            )}
            {aiSettings?.providers[AIProvider.OPENAI] && (
              <SelectGroup>
                <SelectLabel>OpenAI</SelectLabel>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
              </SelectGroup>
            )}
            {aiSettings?.providers[AIProvider.GOOGLE] && (
              <SelectGroup>
                <SelectLabel>Google</SelectLabel>
                <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash</SelectItem>
              </SelectGroup>
            )}
            {aiSettings?.providers[AIProvider.ANTHROPIC] && (
              <SelectGroup>
                <SelectLabel>Anthropic</SelectLabel>
                <SelectItem value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</SelectItem>
              </SelectGroup>
            )}
            {!Object.values(aiSettings?.providers || {}).some((k) => !!k) && (
              <div className="p-2 text-xs text-muted-foreground text-center">
                No providers configured.
                <br />
                Go to Settings to add API keys.
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-lg p-3 text-xs ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              <div className="prose prose-sm dark:prose-invert max-w-none wrap-break-word">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    pre: (props) => {
                      return (
                        <div className="overflow-auto w-full my-2 bg-black/50 rounded-md p-2">
                          <pre {...props} />
                        </div>
                      );
                    },
                    code: (props) => {
                      return <code className="bg-black/20 rounded px-1" {...props} />;
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-background">
        <div className="relative">
          <Textarea
            placeholder="Ask AI to generate SQL"
            value={chatPrompt}
            onChange={(e) => updateTabState(activeTabId, { chatPrompt: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onAiGenerate();
              }
            }}
            className="min-h-[40px] pr-12 resize-none text-xs"
            disabled={isAiGenerating}
          />
          <Button
            size="icon"
            className="absolute bottom-2 right-2 h-6 w-6"
            onClick={onAiGenerate}
            disabled={isButtonDisabled}
          >
            {isAiGenerating ? (
              <svg
                className="animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
