import { AIProviderDescriptors } from '@common/ai/constants';
import { AIProvider, AIProviderConfigMap } from '@common/ai/types';
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

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps): React.JSX.Element {
  const { settings, updateSettings } = useSettings();

  const [isSaving, setIsSaving] = useState(false);
  const [providersSettings, setProvidersSettings] = useState<AIProviderConfigMap>(
    settings.providers
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
        providers: providersSettings,
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
          <DialogDescription>Configure your AI providers.</DialogDescription>
        </DialogHeader>

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

        <DialogFooter>
          <Button variant="outline" disabled={isSaving} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={isSaving} onClick={handleSave}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
