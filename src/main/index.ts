import { app, BrowserWindow, session, dialog } from 'electron';
import path from 'path';
import { LocalSqliteRepository } from './db/repository';
import { setupIpcHandlers } from './ipc';

app.setName('Kinguin Price Tracker');

if (process.platform === 'win32') {
  app.setAppUserModelId('com.kinguin.pricetracker');
}

// Single Instance Lock - allow only one running instance of the application
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  dialog.showErrorBox(
    'Kinguin Price Tracker',
    'Aplikacja Kinguin Price Tracker jest już uruchomiona.\nMożesz używać tylko jednej instancji programu jednocześnie.'
  );
  app.quit();
} else {
  let mainWindow: BrowserWindow | null = null;
  let repository: LocalSqliteRepository | null = null;

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });

  async function createWindow() {
    const userDataPath = app.getPath('userData');
    repository = new LocalSqliteRepository(userDataPath);
    await repository.init();

    setupIpcHandlers(repository);

    // Security: Set Content Security Policy header
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' https: data:;"
          ]
        }
      });
    });

    const iconPath = path.join(__dirname, '../../build/icon.ico');

    mainWindow = new BrowserWindow({
      width: 1100,
      height: 780,
      minWidth: 800,
      minHeight: 600,
      title: 'Kinguin Price Tracker',
      icon: iconPath,
      backgroundColor: '#0b0d10',
      show: false,
      frame: false,
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        sandbox: true,
        nodeIntegration: false,
        preload: path.join(__dirname, '../preload/index.js')
      }
    });

    mainWindow.once('ready-to-show', () => {
      mainWindow?.show();
    });

    if (process.env.VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
      mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // Phase 1 background refresh on app startup
    triggerBackgroundRefresh();
  }

  async function triggerBackgroundRefresh() {
    if (!repository) return;
    try {
      const products = await repository.listTrackedProducts();
      const now = Date.now();
      const SIX_HOURS = 6 * 3600 * 1000;

      for (const product of products) {
        const lastChecked = product.lastCheckedAt ? new Date(product.lastCheckedAt).getTime() : 0;
        if (now - lastChecked > SIX_HOURS) {
          // Stagger requests to avoid burst
          await new Promise(resolve => setTimeout(resolve, 2000));
          try {
            // Send background IPC refresh event if window exists
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('background-refresh-item', product.id);
            }
          } catch {
            // ignore background errors
          }
        }
      }
    } catch {
      // ignore
    }
  }

  app.whenReady().then(createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}

