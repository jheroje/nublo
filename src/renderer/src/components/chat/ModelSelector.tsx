import { AIProviderDescriptors } from '@common/ai/constants';
import { AIProvider, AIProviderConfigMap } from '@common/ai/types';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@renderer/shadcn/ui/select';
import { MODEL_KEY_SEPARATOR } from '../RightPanel';

type ModelSelectorProps = {
  selectedModel: string;
  onChange: (model: string) => void;
  enabledProviders: AIProvider[];
  providerSettings: AIProviderConfigMap;
};

export const ModelSelector = ({
  selectedModel,
  onChange,
  enabledProviders,
  providerSettings,
}: ModelSelectorProps) => (
  <Select value={selectedModel} onValueChange={onChange}>
    <SelectTrigger size="sm" className="text-xs">
      <SelectValue placeholder="Select a model" />
    </SelectTrigger>
    <SelectContent className="text-xs">
      {enabledProviders.length ? (
        enabledProviders.map((provider) => (
          <SelectGroup key={provider}>
            <SelectLabel>{AIProviderDescriptors[provider].name}</SelectLabel>
            {providerSettings[provider].models.map((model) => (
              <SelectItem key={model.key} value={`${provider}${MODEL_KEY_SEPARATOR}${model.key}`}>
                {model.name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))
      ) : (
        <div className="p-2 text-xs text-muted-foreground text-center">No providers configured</div>
      )}
    </SelectContent>
  </Select>
);
