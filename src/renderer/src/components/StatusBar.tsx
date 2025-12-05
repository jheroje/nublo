import { ConnectionColor, useConnection } from '@renderer/contexts/connection/ConnectionContext';
import { wcagContrast } from 'culori';
import { Plug, Unplug } from 'lucide-react';
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

export function StatusBar(): React.JSX.Element {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <div className="h-6 w-full border-t flex items-center p-3 text-xs bg-muted/30">
        <Unplug className="h-3.5 w-3.5 mr-2 text-muted-foreground/50" />
        <span className="font-medium text-muted-foreground/50">Not connected</span>
      </div>
    );
  }

  const useDarkText = shouldUseDarkText(activeConnection.color);

  return (
    <div
      className={`h-6 w-full border-t flex items-center p-3 text-xs bg-${activeConnection.color}`}
    >
      <Plug className={`h-3.5 w-3.5 mr-2 ${useDarkText ? 'text-black' : 'text-white'}`} />
      <span className={`font-medium ${useDarkText ? 'text-black' : 'text-white'}`}>
        {activeConnection.name}
      </span>
    </div>
  );
}
