import { AIMessage } from '@common/ai/types';
import { QueryResult } from '@common/db/types';
import { createContext, useContext } from 'react';

export type TabsState = {
  tabs: Tab[];
  activeTabId: string;
};

export type EditorTab = {
  type: 'editor';
  id: string;
  title: string;
  editorSQL: string;
  queryResult: QueryResult | null;
  queryError: string;
  chatMessages: AIMessage[];
  chatPrompt: string;
  selectedModel: string;
};

export type SchemaTab = {
  type: 'schema';
  id: string;
  title: string;
};

export type Tab = EditorTab | SchemaTab;

export type TabsContextValue = {
  tabs: Tab[];
  activeTabId: string;
  addTab: () => void;
  addSchemaTab: () => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabState: (id: string, updates: Partial<EditorTab>) => void;
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

export function useEditorTab() {
  const context = useTabs();
  const { activeTab } = context;

  if (activeTab.type !== 'editor') {
    throw new Error('useEditorTab must be used within an editor tab context');
  }

  return {
    ...context,
    activeTab,
  };
}
