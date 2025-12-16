import { AIMessage } from '@common/ai/types';
import { ReactNode, useReducer } from 'react';
import { EditorTab, Tab, TabsContext, TabsState } from './TabsContext';

type TabAction =
  | { type: 'ADD_TAB' }
  | { type: 'ADD_SCHEMA_TAB' }
  | { type: 'REMOVE_TAB'; id: string }
  | { type: 'SET_ACTIVE_TAB'; id: string }
  | { type: 'UPDATE_TAB'; id: string; updates: Partial<EditorTab> }
  | { type: 'CHAT_APPEND_MESSAGE'; id: string; message: AIMessage }
  | { type: 'CHAT_UPDATE_LAST_MESSAGE'; id: string; update: Partial<AIMessage> };

const createTab = (tabNumber: number): EditorTab => ({
  type: 'editor',
  id: crypto.randomUUID(),
  title: `Query ${tabNumber}`,
  editorSQL: 'SELECT orders.*, users.* FROM orders JOIN users ON users.id = orders.user_id;',
  queryResult: null,
  queryError: '',
  chatMessages: [],
  chatPrompt: '',
  selectedModel: '',
});

function updateEditorTab(tabs: Tab[], id: string, updater: (tab: EditorTab) => EditorTab): Tab[] {
  return tabs.map((t) => {
    if (t.id === id && t.type === 'editor') {
      return updater(t);
    }
    return t;
  });
}

function tabsReducer(state: TabsState, action: TabAction): TabsState {
  switch (action.type) {
    case 'ADD_TAB': {
      const newTab = createTab(state.tabs.filter((t) => t.type === 'editor').length + 1);
      return {
        ...state,
        tabs: [...state.tabs, newTab],
        activeTabId: newTab.id,
      };
    }
    case 'ADD_SCHEMA_TAB': {
      const existingSchemaTab = state.tabs.find((t) => t.type === 'schema');
      if (existingSchemaTab) {
        return { ...state, activeTabId: existingSchemaTab.id };
      }
      const newTab: Tab = { type: 'schema', id: crypto.randomUUID(), title: 'Schema' };
      return { ...state, tabs: [...state.tabs, newTab], activeTabId: newTab.id };
    }
    case 'REMOVE_TAB': {
      if (state.tabs.length === 1) return state;
      const newTabs = state.tabs.filter((t) => t.id !== action.id);
      const isActive = state.activeTabId === action.id;
      return {
        ...state,
        tabs: newTabs,
        activeTabId: isActive
          ? newTabs[Math.max(0, state.tabs.findIndex((t) => t.id === action.id) - 1)].id
          : state.activeTabId,
      };
    }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTabId: action.id };
    case 'UPDATE_TAB':
      return {
        ...state,
        tabs: updateEditorTab(state.tabs, action.id, (t) => ({ ...t, ...action.updates })),
      };
    case 'CHAT_APPEND_MESSAGE':
      return {
        ...state,
        tabs: updateEditorTab(state.tabs, action.id, (t) => ({
          ...t,
          chatMessages: [...t.chatMessages, action.message],
        })),
      };
    case 'CHAT_UPDATE_LAST_MESSAGE':
      return {
        ...state,
        tabs: updateEditorTab(state.tabs, action.id, (t) => {
          const msgs = [...t.chatMessages];
          if (msgs.length === 0) return t;
          const last = msgs[msgs.length - 1];
          msgs[msgs.length - 1] = { ...last, ...action.update };
          return { ...t, chatMessages: msgs };
        }),
      };
    default:
      return state;
  }
}
type TabsProviderProps = {
  children: ReactNode;
};

export function TabsProvider({ children }: TabsProviderProps) {
  const firstTab = createTab(1);
  const [state, dispatch] = useReducer(tabsReducer, {
    tabs: [firstTab],
    activeTabId: firstTab.id,
  });
  const addTab = () => dispatch({ type: 'ADD_TAB' });
  const addSchemaTab = () => dispatch({ type: 'ADD_SCHEMA_TAB' });
  const removeTab = (id: string) => dispatch({ type: 'REMOVE_TAB', id });
  const setActiveTab = (id: string) => dispatch({ type: 'SET_ACTIVE_TAB', id });
  const updateTabState = (id: string, updates: Partial<EditorTab>) =>
    dispatch({ type: 'UPDATE_TAB', id, updates });
  const appendMessage = (id: string, message: AIMessage) =>
    dispatch({ type: 'CHAT_APPEND_MESSAGE', id, message });
  const updateLastMessage = (id: string, update: Partial<AIMessage>) =>
    dispatch({ type: 'CHAT_UPDATE_LAST_MESSAGE', id, update });
  return (
    <TabsContext.Provider
      value={{
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        addTab,
        addSchemaTab,
        removeTab,
        setActiveTab,
        updateTabState,
        appendMessage,
        updateLastMessage,
      }}
    >
      {children}
    </TabsContext.Provider>
  );
}
