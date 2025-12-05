import { AIMessage, QueryResult } from '@common/types';
import { createContext, useContext } from 'react';

export type TabsState = {
  tabs: Tab[];
  activeTabId: string;
};

export type Tab = {
  id: string;
  title: string;
  editorSQL: string;
  queryResult: QueryResult | null;
  queryError: string;
  chatMessages: AIMessage[];
  chatPrompt: string;
  selectedModel: string;
};

type TabsContextValue = {
  tabs: Tab[];
  activeTabId: string;
  addTab: () => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabState: (id: string, updates: Partial<Tab>) => void;
  appendMessage: (id: string, message: AIMessage) => void;
  updateLastMessage: (id: string, update: Partial<AIMessage>) => void;
};

export const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export function useTabs() {
  const context = useContext(TabsContext);

  if (context === undefined) {
    throw new Error('useTabs must be used within a TabsProvider');
  }

  const activeTab = context.tabs.find((t) => t.id === context.activeTabId);

  if (!activeTab) {
    throw new Error('Invariant violated: activeTabId does not match any tab');
  }

  return { ...context, activeTab };
}
