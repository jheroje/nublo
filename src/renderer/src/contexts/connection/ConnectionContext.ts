import { createContext, useContext } from 'react';

export const ConnectionColors = [
  'red-500',
  'orange-500',
  'amber-500',
  'yellow-500',
  'lime-500',
  'green-500',
  'emerald-500',
  'teal-500',
  'cyan-500',
  'sky-500',
  'blue-500',
  'indigo-500',
  'violet-500',
  'purple-500',
  'fuchsia-500',
  'pink-500',
  'rose-500',
  'gray-500',
  'neutral-500',
  'stone-500',
  'slate-500',
  'zinc-500',
] as const;

/**
 * Safelist for Tailwind to generate these classes dynamically.
 *
 * Backgrounds:
 * bg-red-500 bg-orange-500 bg-amber-500 bg-yellow-500 bg-lime-500 bg-green-500
 * bg-emerald-500 bg-teal-500 bg-cyan-500 bg-sky-500 bg-blue-500 bg-indigo-500
 * bg-violet-500 bg-purple-500 bg-fuchsia-500 bg-pink-500 bg-rose-500 bg-gray-500
 * bg-neutral-500 bg-stone-500 bg-slate-500 bg-zinc-500
 *
 * Text:
 * text-red-500 text-orange-500 text-amber-500 text-yellow-500 text-lime-500 text-green-500
 * text-emerald-500 text-teal-500 text-cyan-500 text-sky-500 text-blue-500 text-indigo-500
 * text-violet-500 text-purple-500 text-fuchsia-500 text-pink-500 text-rose-500 text-gray-500
 * text-neutral-500 text-stone-500 text-slate-500 text-zinc-500
 *
 */

export type ConnectionColor = (typeof ConnectionColors)[number];

export type Connection = {
  id: string;
  name: string;
  connectionString: string;
  color: ConnectionColor;
};

type ConnectionContextValue = {
  activeConnection: Connection | null;
  isConnected: boolean;
  setActiveConnection: React.Dispatch<React.SetStateAction<Connection | null>>;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  clearActiveConnection: () => void;
};

export const ConnectionContext = createContext<ConnectionContextValue | undefined>(undefined);

export function useConnection() {
  const context = useContext(ConnectionContext);

  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }

  return context;
}
