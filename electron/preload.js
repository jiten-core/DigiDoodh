const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // Add any specific desktop APIs here later (e.g., printing, file system)
    platform: process.platform,
    version: process.versions.electron
});
