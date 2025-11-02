const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Print functionality
  printReceipt: (receiptData) => ipcRenderer.invoke('print-receipt', receiptData),
  getPrinters: () => ipcRenderer.invoke('get-printers'),

  // Settings management
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),

  // Platform info
  platform: process.platform,
  isElectron: true,
});
