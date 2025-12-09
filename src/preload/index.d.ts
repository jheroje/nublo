import { Api } from './types';

declare global {
  interface Window {
    electron: {
      platform: NodeJS.Platform;
      windowAction: {
        minimize: () => void
        maximize: () => void
        close: () => void
      },
    },
    api: Api;
  }
}
