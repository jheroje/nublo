import { AIMessage } from '@common/ai/types';
import { ScrollArea, ScrollBar } from '@renderer/shadcn/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

const MarkdownContent = ({ content }: { content: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeHighlight]}
    components={{
      pre: (props) => (
        <div className="overflow-auto w-full my-2 bg-black/50 rounded-md p-1">
          <pre {...props} />
        </div>
      ),
      code: (props) => (
        <ScrollArea>
          <code className="bg-black/20 rounded px-1" {...props} />
          <ScrollBar orientation="vertical" />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ),
    }}
  >
    {content}
  </ReactMarkdown>
);

export const MessageBubble = ({ message: { role, content } }: { message: AIMessage }) => (
  <div className={`flex flex-col ${role === 'user' ? 'items-end' : 'items-start'}`}>
    <div
      className={`max-w-[90%] rounded-lg p-3 text-xs ${
        role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
      }`}
    >
      <div className="prose prose-sm dark:prose-invert max-w-none wrap-break-word">
        <MarkdownContent content={content} />
      </div>
    </div>
  </div>
);
