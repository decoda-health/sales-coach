export type ProviderName = "claude" | "gemini" | "openai";

export type ModelConfig = {
  id: string;
  provider: ProviderName;
  displayName: string;
};

export interface AIProvider {
  generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    model: string
  ): Promise<string>;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  // Claude
  {
    id: "claude-sonnet-4-20250514",
    provider: "claude",
    displayName: "Claude Sonnet 4",
  },
  {
    id: "claude-opus-4-20250514",
    provider: "claude",
    displayName: "Claude Opus 4",
  },
  {
    id: "claude-haiku-3-5-latest",
    provider: "claude",
    displayName: "Claude Haiku 3.5",
  },
  // Gemini
  {
    id: "gemini-2.0-flash",
    provider: "gemini",
    displayName: "Gemini 2.0 Flash",
  },
  {
    id: "gemini-2.0-pro-exp-02-05",
    provider: "gemini",
    displayName: "Gemini 2.0 Pro",
  },
  {
    id: "gemini-1.5-pro",
    provider: "gemini",
    displayName: "Gemini 1.5 Pro",
  },
  // OpenAI
  {
    id: "gpt-4o",
    provider: "openai",
    displayName: "GPT-4o",
  },
  {
    id: "gpt-4o-mini",
    provider: "openai",
    displayName: "GPT-4o Mini",
  },
  {
    id: "o1",
    provider: "openai",
    displayName: "o1",
  },
];
