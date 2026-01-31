// Electron Preload Script
// Secure bridge between main and renderer processes

const { contextBridge, ipcRenderer } = require('electron')

// Expose safe APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
    // App info
    getAppInfo: () => ipcRenderer.invoke('get-app-info'),

    // Notifications
    showNotification: (title, body) =>
        ipcRenderer.invoke('show-notification', { title, body }),

    // Printing
    printReceipt: (html, silent = false) =>
        ipcRenderer.invoke('print-receipt', { html, silent }),

    // Menu events
    onMenuNewCollection: (callback) =>
        ipcRenderer.on('menu-new-collection', callback),
    onMenuPrint: (callback) =>
        ipcRenderer.on('menu-print', callback),
    onMenuSync: (callback) =>
        ipcRenderer.on('menu-sync', callback),
    onMenuExport: (callback) =>
        ipcRenderer.on('menu-export', callback),
    onMenuBackup: (callback) =>
        ipcRenderer.on('menu-backup', callback),
    onMenuConnectPrinter: (callback) =>
        ipcRenderer.on('menu-connect-printer', callback),
    onMenuConnectScanner: (callback) =>
        ipcRenderer.on('menu-connect-scanner', callback),
    onMenuCheckUpdates: (callback) =>
        ipcRenderer.on('menu-check-updates', callback),

    // Remove listeners
    removeAllListeners: (channel) =>
        ipcRenderer.removeAllListeners(channel),

    // Platform info
    platform: process.platform,
    isElectron: true,
})

// Log when preload is ready
console.log('Electron preload script loaded')
