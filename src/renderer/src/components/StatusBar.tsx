import { ConnectionColor } from '@common/db/types';
import { useConnection } from '@renderer/contexts/connection/ConnectionContext';
import { Button } from '@renderer/shadcn/ui/button';
import { wcagContrast } from 'culori';
import { Plug, Settings, Unplug } from 'lucide-react';
import React from 'react';
import colors from 'tailwindcss/colors';

function getTailwindColor(colorClass: ConnectionColor): string | null {
  const [name, shade] = colorClass.split('-');

  const colorSet = colors[name as keyof typeof colors];

  return colorSet[shade as keyof typeof colorSet] ?? null;
}

function shouldUseDarkText(colorClass: ConnectionColor): boolean {
  const color = getTailwindColor(colorClass);

  if (!color) return false;

  const contrastWhite = wcagContrast(color, 'white');
  const contrastBlack = wcagContrast(color, 'black');

  return contrastBlack > contrastWhite;
}
type StatusBarProps = {
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
};

export function StatusBar({ setShowSettings }: StatusBarProps): React.JSX.Element {
  const { activeConnection } = useConnection();

  const foreground = activeConnection
    ? shouldUseDarkText(activeConnection.color)
      ? 'text-black'
      : 'text-white'
    : 'text-muted-foreground/50';

  const background = activeConnection ? `bg-${activeConnection.color}` : 'bg-muted/30';

  const text = activeConnection ? activeConnection.name : 'Not connected';

  const ConnectionIcon = activeConnection ? Plug : Unplug;

  return (
    <div
      className={`h-8 w-full border-t flex items-center justify-between p-3 text-xs ${background} ${foreground}`}
    >
      <div className="flex items-center gap-2">
        <ConnectionIcon className="size-3.5" />
        <span className="font-medium">{text}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute h-6 w-6 right-2 cursor-pointer"
        onClick={() => setShowSettings(true)}
        title="Settings"
      >
        <Settings className="size-5" />
      </Button>
    </div>
  );
}
