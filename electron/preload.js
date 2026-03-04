// electron/preload.js - Electron Preload Script (Context Bridge)
const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose safe APIs to renderer process
 */
contextBridge.exposeInMainWorld('electron', {
    // Platform info
    getPlatformInfo: () => ipcRenderer.invoke('get-platform-info'),
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),

    // Window controls
    minimizeToTray: () => ipcRenderer.send('minimize-to-tray'),

    // Notifications
    showNotification: (title, body) => {
        ipcRenderer.send('show-notification', { title, body });
    },

    // Navigation (from tray)
    onNavigate: (callback) => {
        ipcRenderer.on('navigate', (event, route) => callback(route));
    },

    // Sync trigger (from tray)
    onTriggerSync: (callback) => {
        ipcRenderer.on('trigger-sync', () => callback());
    },

    // Is Electron environment
    isElectron: true,
    platform: process.platform,
});

console.log('✅ Electron preload script loaded');
