import { ReactNode, useReducer } from 'react';
import { AIMessage } from 'src/types';
import { Tab, TabsContext, TabsState } from './TabsContext';

type TabAction =
  | { type: 'ADD_TAB' }
  | { type: 'REMOVE_TAB'; id: string }
  | { type: 'SET_ACTIVE_TAB'; id: string }
  | { type: 'UPDATE_TAB'; id: string; updates: Partial<Tab> }
  | { type: 'CHAT_APPEND_MESSAGE'; id: string; message: AIMessage }
  | { type: 'CHAT_UPDATE_LAST_MESSAGE'; id: string; update: Partial<AIMessage> };

const createTab = (tabNumber: number): Tab => ({
  id: crypto.randomUUID(),
  title: `Tab ${tabNumber}`,
  editorSQL: '',
  queryResult: null,
  queryError: '',
  chatMessages: [],
  chatPrompt: '',
  selectedModel: 'google/gemini-2.0-flash-exp:free',
});

function tabsReducer(state: TabsState, action: TabAction): TabsState {
  switch (action.type) {
    case 'ADD_TAB': {
      const newTab = createTab(state.tabs.length + 1);

      return {
        ...state,
        tabs: [...state.tabs, newTab],
        activeTabId: newTab.id,
      };
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
        tabs: state.tabs.map((t) => (t.id === action.id ? { ...t, ...action.updates } : t)),
      };

    case 'CHAT_APPEND_MESSAGE':
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.id ? { ...t, chatMessages: [...t.chatMessages, action.message] } : t
        ),
      };

    case 'CHAT_UPDATE_LAST_MESSAGE':
      return {
        ...state,
        tabs: state.tabs.map((t) => {
          if (t.id !== action.id) return t;

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

export function TabsProvider({ children }: { children: ReactNode }) {
  const firstTab = createTab(1);
  const [state, dispatch] = useReducer(tabsReducer, {
    tabs: [firstTab],
    activeTabId: firstTab.id,
  });

  const addTab = () => dispatch({ type: 'ADD_TAB' });
  const removeTab = (id: string) => dispatch({ type: 'REMOVE_TAB', id });
  const setActiveTab = (id: string) => dispatch({ type: 'SET_ACTIVE_TAB', id });
  const updateTabState = (id: string, updates: Partial<Tab>) =>
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
