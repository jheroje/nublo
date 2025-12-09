import 'dotenv/config';

import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { setupAIService } from '@main/ai/aiService';
import { setupDBService } from '@main/db/dbService';
import { setupStoreService } from '@main/store/storeService';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import icon from '../../resources/icon.png?asset';

const __dirname = dirname(fileURLToPath(import.meta.url));

const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';
const isLinux = process.platform === 'linux';

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    titleBarStyle: isMac ? 'hiddenInset' : 'hidden',
    titleBarOverlay: isWindows
      ? {
          color: '#09090b',
          symbolColor: '#ffffff',
          height: 36,
        }
      : undefined,
    ...(isLinux ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      devTools: is.dev,
    },
  });

  mainWindow.on('ready-to-show', () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  ipcMain.on('win-min', () => mainWindow.minimize());
  ipcMain.on('win-max', () =>
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
  );
  ipcMain.on('win-close', () => mainWindow.close());
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  setupStoreService();
  setupDBService();
  setupAIService();

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});
