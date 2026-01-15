import { AIProvider } from "./types";

export class OpenAIProvider implements AIProvider {
  private apiKey: string;

  constructor() {
    const apiKey = process.env.COACH_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("COACH_OPENAI_API_KEY environment variable is not set");
    }
    this.apiKey = apiKey;
  }

  async generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    model: string
  ): Promise<string> {
    // o1 models don't support system messages - prepend to user message instead
    const isO1Model = model.startsWith("o1");

    const messages = isO1Model
      ? [{ role: "user", content: `${systemPrompt}\n\n${userPrompt}` }]
      : [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        ...(isO1Model ? {} : { max_tokens: 4096 }),
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${text}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from OpenAI API");
    }

    return content;
  }
}
