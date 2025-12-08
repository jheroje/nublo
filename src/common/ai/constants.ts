import { AIProvider, AIProviderDescriptor, AIProviderType } from './types';

export const AIProviderDescriptors = {
  [AIProvider.OPENROUTER]: {
    key: AIProvider.OPENROUTER,
    name: 'OpenRouter',
    type: AIProviderType.CLOUD,
    initField: {
      key: 'apiKey',
      label: 'API Key',
      placeholder: 'sk-or-...',
      type: 'password',
      help: { url: 'https://openrouter.ai/keys', label: 'Get API Key' },
    },
    models: [
      { key: 'openai/gpt-oss-20b:free', name: 'GPT OSS 20B' },
      { key: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash' },
      { key: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B' },
    ],
  },
  [AIProvider.OPENAI]: {
    key: AIProvider.OPENAI,
    name: 'OpenAI',
    type: AIProviderType.CLOUD,
    initField: {
      key: 'apiKey',
      label: 'API Key',
      placeholder: 'sk-...',
      type: 'password',
      help: { url: 'https://platform.openai.com/api-keys', label: 'Get API Key' },
    },
    models: [{ key: 'gpt-4o-mini', name: 'GPT-4o Mini' }],
  },
  [AIProvider.GOOGLE]: {
    key: AIProvider.GOOGLE,
    name: 'Google AI',
    type: AIProviderType.CLOUD,
    initField: {
      key: 'apiKey',
      label: 'API Key',
      placeholder: 'AIza...',
      type: 'password',
      help: { url: 'https://aistudio.google.com/app/apikey', label: 'Get API Key' },
    },
    models: [{ key: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash' }],
  },
  [AIProvider.ANTHROPIC]: {
    key: AIProvider.ANTHROPIC,
    name: 'Anthropic',
    type: AIProviderType.CLOUD,
    initField: {
      key: 'apiKey',
      label: 'API Key',
      placeholder: 'sk-ant-...',
      type: 'password',
      help: { url: 'https://console.anthropic.com/settings/keys', label: 'Get API Key' },
    },
    models: [{ key: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' }],
  },
  [AIProvider.OLLAMA]: {
    key: AIProvider.OLLAMA,
    name: 'Ollama',
    type: AIProviderType.LOCAL,
    initField: {
      key: 'baseURL',
      label: 'Base URL',
      placeholder: 'http://localhost:11434/api',
      type: 'url',
      help: { url: 'https://ollama.com', label: 'Set up local models' },
    },
    models: [{ key: 'llama3', name: 'Llama 3' }],
  },
} as const satisfies Record<AIProvider, AIProviderDescriptor>;
