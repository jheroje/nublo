import { AnthropicProvider, createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI, GoogleGenerativeAIProvider } from '@ai-sdk/google';
import { createOpenAI, OpenAIProvider } from '@ai-sdk/openai';
import { AIProvider, AISettings } from '@common/types';
import { createOpenRouter, OpenRouterProvider } from '@openrouter/ai-sdk-provider';

export type ProviderInstance =
  | OpenRouterProvider
  | OpenAIProvider
  | GoogleGenerativeAIProvider
  | AnthropicProvider;

// TODO: improve this
export function getProviderFromModel(model: string): AIProvider {
  // OpenRouter models typically have format: "provider/model-name"
  if (model.includes('/')) {
    return AIProvider.OPENROUTER;
  }

  // OpenAI models: gpt-4, gpt-3.5-turbo, etc.
  if (model.startsWith('gpt-') || model.startsWith('o1-')) {
    return AIProvider.OPENAI;
  }

  // Google models: gemini-pro, gemini-2.0-flash-exp, etc.
  if (model.startsWith('gemini-')) {
    return AIProvider.GOOGLE;
  }

  // Anthropic models: claude-3-opus, claude-3-sonnet, etc.
  if (model.startsWith('claude-')) {
    return AIProvider.ANTHROPIC;
  }

  // Default to OpenRouter for unknown formats
  return AIProvider.OPENROUTER;
}

export function createProvider(provider: AIProvider, apiKey: string): ProviderInstance {
  switch (provider) {
    case AIProvider.OPENROUTER:
      return createOpenRouter({ apiKey });

    case AIProvider.OPENAI:
      return createOpenAI({ apiKey });

    case AIProvider.GOOGLE:
      return createGoogleGenerativeAI({ apiKey });

    case AIProvider.ANTHROPIC:
      return createAnthropic({ apiKey });

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export function getProviderAndModel(
  model: string,
  settings: AISettings
): { provider: ProviderInstance; modelId: string } {
  const providerType = getProviderFromModel(model);
  const apiKey = settings.providers[providerType];

  if (!apiKey) {
    throw new Error(
      `No API key configured for ${providerType}. Please configure your API keys in settings.`
    );
  }

  const provider = createProvider(providerType, apiKey);

  return {
    provider,
    modelId: model,
  };
}
