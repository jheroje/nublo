import { AIProviderDescriptors } from '@common/ai/constants';
import { AIProvider, AIProviderConfigMap } from '@common/ai/types';
import { useSettings } from '@renderer/contexts/settings/SettingsContext';
import { Button } from '@renderer/shadcn/ui/button';
import { Input } from '@renderer/shadcn/ui/input';
import { Label } from '@renderer/shadcn/ui/label';
import { useState } from 'react';

type AIProvidersSettingsProps = {
  onSave?: () => void;
};

export function AIProvidersSettings({ onSave }: AIProvidersSettingsProps) {
  const { settings, updateSettings } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [providersSettings, setProvidersSettings] = useState<AIProviderConfigMap>(
    settings.ai.providers
  );

  const updateProvider = (provider: AIProvider, newValue: string) => {
    setProvidersSettings((prev) => {
      const oldConfig = prev[provider];

      const updated: AIProviderConfigMap = {
        ...prev,
        [provider]: {
          ...oldConfig,
          enabled: Boolean(newValue),
          initField: {
            ...oldConfig.initField,
            value: newValue,
          },
        },
      };

      return updated;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        ai: {
          providers: providersSettings,
        },
      });
      onSave?.();
    } catch (error) {
      console.error('Failed to save AI settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 py-4">
        {Object.values(AIProviderDescriptors).map((provider) => {
          const config = providersSettings[provider.key];

          return (
            <div key={provider.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor={provider.key}
                  className="text-sm font-medium flex items-center gap-2"
                >
                  {provider.name}
                  {config.enabled && <span className="h-2 w-2 rounded-full bg-green-500" />}
                </Label>

                {provider.initField.help && (
                  <a
                    href={provider.initField.help.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    {provider.initField.help.label}
                  </a>
                )}
              </div>

              <Input
                id={provider.key}
                type={provider.initField.type}
                placeholder={provider.initField.placeholder}
                value={config.initField.value}
                onChange={(e) => updateProvider(provider.key, e.target.value)}
                className="text-xs"
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-end">
        <Button disabled={isSaving} onClick={handleSave}>
          {isSaving ? 'Saving...' : 'Save AI Settings'}
        </Button>
      </div>
    </div>
  );
}
