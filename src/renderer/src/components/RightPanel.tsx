import { Button } from '@renderer/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@renderer/components/ui/select';
import { Textarea } from '@renderer/components/ui/textarea';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { AIMessage } from 'src/types';

interface RightPanelProps {
  chatMessages: AIMessage[];
  aiPrompt: string;
  setAiPrompt: (value: string) => void;
  isConnected: boolean;
  onAiGenerate: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export function RightPanel({
  chatMessages,
  aiPrompt,
  setAiPrompt,
  isConnected,
  onAiGenerate,
  selectedModel,
  onModelChange,
}: RightPanelProps): React.JSX.Element {
  return (
    <>
      <div className="h-10 border-b flex items-center justify-between px-4 bg-muted/20">
        <span className="font-medium text-xs text-muted-foreground">AI ASSISTANT</span>
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger size="sm" className="w-fit text-xs">
            <SelectValue placeholder="Select a model..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="google/gemini-2.0-flash-exp:free">
              Gemini 2.0 Flash (Free)
            </SelectItem>
            <SelectItem value="openai/gpt-oss-20b:free">GPT OSS 20B (Free)</SelectItem>
            <SelectItem value="meta-llama/llama-3.2-3b-instruct:free">
              Llama 3.2 3B (Free)
            </SelectItem>
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
              className={`max-w-[90%] rounded-lg p-3 text-sm ${
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

      <div className="p-4 border-t bg-background">
        <div className="relative">
          <Textarea
            placeholder="Ask AI to generate SQL"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onAiGenerate();
              }
            }}
            className="min-h-[80px] pr-12 resize-none text-sm"
          />
          <Button
            size="icon"
            className="absolute bottom-2 right-2 h-8 w-8"
            onClick={onAiGenerate}
            disabled={!isConnected || !aiPrompt.trim()}
          >
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
          </Button>
        </div>
      </div>
    </>
  );
}
