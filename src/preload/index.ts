import { contextBridge, ipcRenderer } from 'electron';
import { ElectronAPI, TimePeriod } from '../shared/types';

const api: ElectronAPI = {
  trackProduct: (url: string) => ipcRenderer.invoke('track-product', url),
  getProducts: () => ipcRenderer.invoke('get-products'),
  getProductDetail: (id: string, period?: TimePeriod) => ipcRenderer.invoke('get-product-detail', id, period),
  refreshProduct: (id: string) => ipcRenderer.invoke('refresh-product', id),
  deleteProduct: (id: string) => ipcRenderer.invoke('delete-product', id),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close')
};

contextBridge.exposeInMainWorld('api', api);
