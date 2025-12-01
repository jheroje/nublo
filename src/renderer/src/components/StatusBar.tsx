import { Plug, Unplug } from 'lucide-react';
import React from 'react';

import { useConnection } from '@renderer/contexts/connection/ConnectionContext';
import { wcagContrast } from 'culori';
import colors from 'tailwindcss/colors';

function getTailwindColor(twClass: string): string | null {
  const match = twClass.match(/^bg-(.+)-(\d{3})$/);

  if (!match) return null;

  const [, name, shade] = match;

  const colorSet = colors[name as keyof typeof colors];

  return colorSet?.[shade as keyof typeof colorSet] ?? null;
}

function shouldUseDarkText(bgColor: string): boolean {
  const color = getTailwindColor(bgColor);

  if (!color) return false;

  const contrastWhite = wcagContrast(color, 'white');
  const contrastBlack = wcagContrast(color, 'black');

  return contrastBlack > contrastWhite;
}

export function StatusBar(): React.JSX.Element {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <div className="h-6 w-full border-t flex items-center p-3 text-sm bg-muted/30">
        <Unplug className="h-3.5 w-3.5 mr-2 text-muted-foreground/50" />
        <span className="font-medium text-muted-foreground/50">Not connected</span>
      </div>
    );
  }

  const useDarkText = shouldUseDarkText(activeConnection.color);

  return (
    <div className={`h-6 w-full border-t flex items-center p-3 text-sm ${activeConnection.color}`}>
      <Plug className={`h-3.5 w-3.5 mr-2 ${useDarkText ? 'text-black' : 'text-white'}`} />
      <span className={`font-medium ${useDarkText ? 'text-black' : 'text-white'}`}>
        {activeConnection.name}
      </span>
    </div>
  );
}
