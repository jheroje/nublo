import { AIProvider } from './types';

export function isAIProvider(value: string): value is AIProvider {
  return Object.values(AIProvider).includes(value as AIProvider);
}
