import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@renderer/shadcn/ui/dialog';
import React, { useState } from 'react';
import { AIProvidersSettings } from './settings/sections/AIProvidersSettings';
import { AppearanceSettings } from './settings/sections/AppearanceSettings';
import { SettingsSidebar, SettingsTab } from './settings/SettingsSidebar';

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-180 h-160 flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your application settings</DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          <div className="p-4 border-r bg-muted/10">
            <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'appearance' && <AppearanceSettings />}
            {activeTab === 'ai' && <AIProvidersSettings onSave={() => onOpenChange(false)} />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
