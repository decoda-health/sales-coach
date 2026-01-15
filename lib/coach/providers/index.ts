import { AIProvider, AVAILABLE_MODELS, ModelConfig, ProviderName } from "./types";
import { ClaudeProvider } from "./claude";
import { GeminiProvider } from "./gemini";
import { OpenAIProvider } from "./openai";

export { AVAILABLE_MODELS, type ModelConfig, type ProviderName, type AIProvider };

export function getModelConfig(modelId: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === modelId);
}

export function getProvider(providerName: ProviderName): AIProvider {
  switch (providerName) {
    case "claude":
      return new ClaudeProvider();
    case "gemini":
      return new GeminiProvider();
    case "openai":
      return new OpenAIProvider();
    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
}

export function getProviderForModel(modelId: string): AIProvider {
  const config = getModelConfig(modelId);
  if (!config) {
    throw new Error(`Unknown model: ${modelId}`);
  }
  return getProvider(config.provider);
}
