import { cn } from '@renderer/shadcn/utils';
import { Cpu, PaintBucket } from 'lucide-react';
import { Button } from '../../shadcn/ui/button';

export type SettingsTab = 'appearance' | 'ai';

type SettingsSidebarProps = {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
};

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'appearance',
      label: 'Appearance',
      icon: <PaintBucket className="h-4 w-4" />,
    },
    {
      id: 'ai',
      label: 'AI Providers',
      icon: <Cpu className="h-4 w-4" />,
    },
  ];

  return (
    <div className="w-38 pr-4 space-y-2">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? 'secondary' : 'ghost'}
          className={cn('w-full justify-start gap-2', activeTab === tab.id && 'bg-secondary')}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon}
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
