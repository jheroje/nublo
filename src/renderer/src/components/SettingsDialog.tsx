import { AIProvider, AIProviderConfig } from '@common/types';
import { useSettings } from '@renderer/contexts/settings/SettingsContext';
import { Button } from '@renderer/shadcn/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@renderer/shadcn/ui/dialog';
import { Input } from '@renderer/shadcn/ui/input';
import { Label } from '@renderer/shadcn/ui/label';
import React, { useState } from 'react';

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ProviderInfo = { name: string; placeholder: string; helpUrl: string };

const PROVIDER_INFO = {
  [AIProvider.OPENROUTER]: {
    name: 'OpenRouter',
    placeholder: 'sk-or-...',
    helpUrl: 'https://openrouter.ai/keys',
  },
  [AIProvider.OPENAI]: {
    name: 'OpenAI',
    placeholder: 'sk-...',
    helpUrl: 'https://platform.openai.com/api-keys',
  },
  [AIProvider.GOOGLE]: {
    name: 'Google AI',
    placeholder: 'AIza...',
    helpUrl: 'https://aistudio.google.com/app/apikey',
  },
  [AIProvider.ANTHROPIC]: {
    name: 'Anthropic',
    placeholder: 'sk-ant-...',
    helpUrl: 'https://console.anthropic.com/settings/keys',
  },
} satisfies Record<AIProvider, ProviderInfo>;

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps): React.JSX.Element {
  const { aiSettings, updateAiSettings, isLoading } = useSettings();
  const [apiKeys, setApiKeys] = useState(aiSettings?.providers ?? {});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const providers: AIProviderConfig = Object.fromEntries(
        Object.entries(apiKeys).filter(([, key]) => key.trim())
      );

      await updateAiSettings({
        providers,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save AI settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>AI Provider Settings</DialogTitle>
          <DialogDescription>Configure your API keys for AI providers.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading settings...</div>
        ) : (
          <div className="space-y-4 py-4">
            {Object.values(AIProvider).map((provider) => {
              const info = PROVIDER_INFO[provider];
              const key = apiKeys[provider] ?? '';

              return (
                <div key={provider} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={provider}
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      {info.name}
                      {key && <span className="h-2 w-2 rounded-full bg-green-500" />}
                    </Label>
                    <a
                      href={info.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Get API Key
                    </a>
                  </div>

                  <Input
                    id={provider}
                    type="password"
                    placeholder={info.placeholder}
                    value={key}
                    onChange={(e) =>
                      setApiKeys((prev) => ({ ...prev, [provider]: e.target.value }))
                    }
                    className="text-xs"
                  />
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" disabled={isSaving} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={isSaving || isLoading} onClick={handleSave}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
