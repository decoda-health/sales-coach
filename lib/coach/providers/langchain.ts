import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AIProvider, ProviderName } from "./types";

export class LangChainProvider implements AIProvider {
  private providerName: ProviderName;

  constructor(providerName: ProviderName) {
    this.providerName = providerName;
  }

  async generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    model: string
  ): Promise<string> {
    const chatModel = this.getChatModel(model);

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ];

    const response = await chatModel.invoke(messages);
    const content = response.content;

    if (typeof content !== "string") {
      throw new Error("Unexpected response format from LangChain");
    }

    return content;
  }

  private getChatModel(model: string) {
    switch (this.providerName) {
      case "claude":
        return new ChatAnthropic({
          model,
          maxTokens: 4096,
        });
      case "openai":
        return new ChatOpenAI({
          model,
          maxTokens: model.startsWith("o1") ? undefined : 4096,
        });
      case "gemini":
        return new ChatGoogleGenerativeAI({
          model,
          maxOutputTokens: 4096,
        });
      default:
        throw new Error(`Unknown provider: ${this.providerName}`);
    }
  }
}
