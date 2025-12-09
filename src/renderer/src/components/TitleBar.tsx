import { Button } from '@renderer/shadcn/ui/button';
import { Minus, Square, X } from 'lucide-react';

const { platform, windowAction } = window.electron;

const isMac = platform === 'darwin';
const isLinux = platform === 'linux';

export default function TitleBar() {
  if (isMac) {
    return (
      <div className="h-9 w-full bg-muted/30 app-drag flex justify-center items-center">
        <p className="text-xs font-bold">Nublo</p>
      </div>
    );
  }

  if (isLinux) {
    return (
      <div className="h-9 w-full bg-muted/30 app-drag flex justify-center items-center">
        <p className="text-xs font-bold">Nublo</p>

        <div className="flex gap-1 items-center absolute right-2">
          <Button
            variant="ghost"
            className="app-no-drag hover:bg-muted cursor-pointer h-6 w-6 rounded-sm"
            onClick={() => windowAction.minimize()}
          >
            <Minus className="size-4" />
          </Button>
          <Button
            variant="ghost"
            className="app-no-drag hover:bg-muted cursor-pointer h-6 w-6 rounded-sm"
            onClick={() => windowAction.maximize()}
          >
            <Square className="size-3" />
          </Button>
          <Button
            variant="ghost"
            className="app-no-drag hover:bg-muted cursor-pointer h-6 w-6 rounded-sm"
            onClick={() => windowAction.close()}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
