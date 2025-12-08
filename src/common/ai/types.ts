import { AIProviderDescriptors } from './constants';

// Base types
export enum AIProvider {
  OPENROUTER = 'openrouter',
  OPENAI = 'openai',
  GOOGLE = 'google',
  ANTHROPIC = 'anthropic',
  OLLAMA = 'ollama',
}

export enum AIProviderType {
  CLOUD = 'cloud',
  LOCAL = 'local',
}

type AIModelInfo = {
  key: string;
  name: string;
};

type AIProviderField = {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'number';
  placeholder?: string;
  help?: {
    url: string;
    label: string;
  };
};

export type AIProviderDescriptor = {
  key: AIProvider;
  name: string;
  type: AIProviderType;
  initField: AIProviderField;
  models: AIModelInfo[];
};

// Settings types
type AIProviderDescriptorMap = typeof AIProviderDescriptors;

type AIProviderInitFieldKey<P extends AIProvider> = AIProviderDescriptorMap[P]['initField']['key'];

type AIProviderConfigInitField<P extends AIProvider> = {
  key: AIProviderInitFieldKey<P>;
  value: string;
};

type AIProviderConfig<P extends AIProvider> = {
  enabled: boolean;
  models: AIModelInfo[];
  initField: AIProviderConfigInitField<P>;
};

export type AIProviderConfigMap = {
  [P in AIProvider]: AIProviderConfig<P>;
};

export type AISettings = {
  providers: AIProviderConfigMap;
};

// Chat types
export type AIMessage = {
  role: 'user' | 'assistant';
  content: string;
};
