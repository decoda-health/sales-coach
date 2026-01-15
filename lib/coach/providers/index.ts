import { AIProvider, AVAILABLE_MODELS, ModelConfig, ProviderName } from "./types";
import { LangChainProvider } from "./langchain";

export { AVAILABLE_MODELS, type ModelConfig, type ProviderName, type AIProvider };

export function getModelConfig(modelId: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === modelId);
}

export function getProvider(providerName: ProviderName): AIProvider {
  return new LangChainProvider(providerName);
}

export function getProviderForModel(modelId: string): AIProvider {
  const config = getModelConfig(modelId);
  if (!config) {
    throw new Error(`Unknown model: ${modelId}`);
  }
  return getProvider(config.provider);
}
