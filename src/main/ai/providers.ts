import { AnthropicProvider, createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI, GoogleGenerativeAIProvider } from '@ai-sdk/google';
import { createOpenAI, OpenAIProvider } from '@ai-sdk/openai';
import { AIProvider, AISettings } from '@common/ai/types';
import { createOpenRouter, OpenRouterProvider } from '@openrouter/ai-sdk-provider';
import { LanguageModel } from 'ai';
import { createOllama, OllamaProvider } from 'ollama-ai-provider-v2';

export type ProviderInstance =
  | OpenRouterProvider
  | OpenAIProvider
  | GoogleGenerativeAIProvider
  | AnthropicProvider
  | OllamaProvider;

const ProviderFactories: Record<AIProvider, (value: string) => ProviderInstance> = {
  [AIProvider.OPENROUTER]: (apiKey) => createOpenRouter({ apiKey }),
  [AIProvider.OPENAI]: (apiKey) => createOpenAI({ apiKey }),
  [AIProvider.GOOGLE]: (apiKey) => createGoogleGenerativeAI({ apiKey }),
  [AIProvider.ANTHROPIC]: (apiKey) => createAnthropic({ apiKey }),
  [AIProvider.OLLAMA]: (baseURL) => createOllama({ baseURL }),
};

export function getLanguageModel(
  provider: AIProvider,
  model: string,
  settings: AISettings
): LanguageModel {
  const config = settings.providers[provider];

  if (!config.initField.value) {
    throw new Error(
      `No ${config.initField.key} provided for ${provider}. Please check your settings.`
    );
  }

  const providerInstance = ProviderFactories[provider](config.initField.value);

  return providerInstance(model);
}
