import { app, BrowserWindow, session, dialog } from 'electron';
import path from 'path';
import dotenv from 'dotenv';
import { PriceRepository, LocalSqliteRepository } from './db/repository';
import { RemoteApiRepository } from './db/remoteRepository';
import { setupIpcHandlers } from './ipc';
import { Logger } from './logger';

dotenv.config();

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
  let repository: PriceRepository | null = null;

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });

  async function createWindow() {
    const backendUrl = process.env.BACKEND_API_URL;
    const userDataPath = app.getPath('userData');

    if (backendUrl) {
      try {
        Logger.info('App', `BACKEND_API_URL set. Connecting to Remote Backend API: ${backendUrl}...`);
        const remoteRepo = new RemoteApiRepository(backendUrl, userDataPath);
        await remoteRepo.init();
        repository = remoteRepo;
      } catch (err: any) {
        Logger.error('App', `Failed to connect to Backend API (${err.message}). Falling back to Local SQLite.`);
        const sqliteRepo = new LocalSqliteRepository(userDataPath);
        await sqliteRepo.init();
        repository = sqliteRepo;
      }
    } else {
      Logger.info('App', 'No BACKEND_API_URL specified. Initializing Local SQLite Repository.');
      const sqliteRepo = new LocalSqliteRepository(userDataPath);
      await sqliteRepo.init();
      repository = sqliteRepo;
    }

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

