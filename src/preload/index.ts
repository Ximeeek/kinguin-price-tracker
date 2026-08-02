import { contextBridge, ipcRenderer } from 'electron';
import { ElectronAPI, TimePeriod } from '../shared/types';

const api: ElectronAPI = {
  trackProduct: (url: string) => ipcRenderer.invoke('track-product', url),
  getProducts: () => ipcRenderer.invoke('get-products'),
  getProductDetail: (id: string, period?: TimePeriod) => ipcRenderer.invoke('get-product-detail', id, period),
  refreshProduct: (id: string) => ipcRenderer.invoke('refresh-product', id),
  deleteProduct: (id: string) => ipcRenderer.invoke('delete-product', id),
  checkSystemStatus: () => ipcRenderer.invoke('check-system-status'),
  onBackendStatusChanged: (callback: (data: any) => void) => {
    const handler = (_event: any, data: any) => callback(data);
    ipcRenderer.on('backend-status-changed', handler);
    return () => ipcRenderer.removeListener('backend-status-changed', handler);
  },
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close')
};

contextBridge.exposeInMainWorld('api', api);
