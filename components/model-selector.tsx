"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AVAILABLE_MODELS, ProviderName } from "@/lib/coach/providers";

type Props = {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
};

const PROVIDER_LABELS: Record<ProviderName, string> = {
  claude: "Anthropic",
  gemini: "Google",
  openai: "OpenAI",
};

const PROVIDER_ORDER: ProviderName[] = ["claude", "gemini", "openai"];

export function ModelSelector({ value, onChange, disabled }: Props) {
  const modelsByProvider = PROVIDER_ORDER.map((provider) => ({
    provider,
    label: PROVIDER_LABELS[provider],
    models: AVAILABLE_MODELS.filter((m) => m.provider === provider),
  }));

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-[180px] h-9 bg-background/50">
        <SelectValue placeholder="Select model" />
      </SelectTrigger>
      <SelectContent>
        {modelsByProvider.map(({ provider, label, models }) => (
          <SelectGroup key={provider}>
            <SelectLabel>{label}</SelectLabel>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.displayName}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
