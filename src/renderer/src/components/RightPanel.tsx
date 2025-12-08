import { isAIProvider } from '@common/ai/utils';
import { useConnection } from '@renderer/contexts/connection/ConnectionContext';
import { useSettings } from '@renderer/contexts/settings/SettingsContext';
import { useTabs } from '@renderer/contexts/tabs/TabsContext';
import { Button } from '@renderer/shadcn/ui/button';
import { Textarea } from '@renderer/shadcn/ui/textarea';
import React, { useMemo, useState } from 'react';
import { MessageBubble } from './chat/MessageBubble';
import { ModelSelector } from './chat/ModelSelector';

export const MODEL_KEY_SEPARATOR = ':::';

export function RightPanel(): React.JSX.Element {
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const { settings } = useSettings();
  const { isConnected, schema } = useConnection();
  const { activeTab, activeTabId, updateTabState, appendMessage, updateLastMessage } = useTabs();

  const { chatPrompt, selectedModel, chatMessages } = activeTab;

  const enabledProviders = useMemo(
    () =>
      Object.keys(settings.providers)
        .filter(isAIProvider)
        .filter((provider) => settings.providers[provider].enabled),
    [settings.providers]
  );

  const isWriteDisabled = !selectedModel || !isConnected || isAiGenerating;
  const isSendDisabled = isWriteDisabled || !chatPrompt.trim();

  const onAiGenerate = async (): Promise<void> => {
    if (isSendDisabled) return;

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

      const [provider, model] = selectedModel.split(MODEL_KEY_SEPARATOR);
      const sqlResult = await window.api.ai.generateQuery(
        schema,
        chatPrompt,
        provider,
        model,
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
        <ModelSelector
          selectedModel={selectedModel}
          onChange={(model) => updateTabState(activeTabId, { selectedModel: model })}
          enabledProviders={enabledProviders}
          providerSettings={settings.providers}
        />
      </div>

      {!isConnected || !selectedModel ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 flex items-center text-center text-muted">
          <p>Connect to a DB and select a model to continue</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((message, i) => (
            <MessageBubble key={i} message={message} />
          ))}
        </div>
      )}

      <div className="p-4 bg-background">
        <div className="relative">
          <Textarea
            placeholder="Ask AI to generate SQL"
            value={chatPrompt}
            onChange={(e) => updateTabState(activeTabId, { chatPrompt: e.target.value })}
            onKeyDown={(e) => {
              if (!isSendDisabled && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onAiGenerate();
              }
            }}
            className="min-h-[40px] pr-12 resize-none text-xs"
            disabled={isWriteDisabled}
          />
          <Button
            size="icon"
            className="absolute bottom-2 right-2 h-6 w-6"
            onClick={onAiGenerate}
            disabled={isSendDisabled}
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
