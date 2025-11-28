import { ElectronAPI } from '@electron-toolkit/preload';
import { Api } from '@preload/types';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: Api;
  }
}
