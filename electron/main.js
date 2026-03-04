// electron/main.js - Electron Main Process for DigiDhoodh
const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let tray;

// Keep window state
let windowState = {
    width: 1280,
    height: 800,
    x: undefined,
    y: undefined,
    isMaximized: false,
};

/**
 * Create main application window
 */
function createWindow() {
    // Create browser window
    mainWindow = new BrowserWindow({
        width: windowState.width,
        height: windowState.height,
        x: windowState.x,
        y: windowState.y,
        minWidth: 1024,
        minHeight: 768,
        show: false, // Don't show until ready
        backgroundColor: '#ffffff',
        icon: path.join(__dirname, 'icons', 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js'),
        },
        titleBarStyle: 'default',
        frame: true,
    });

    // Load app
    const startUrl = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../out/index.html')}`;

    mainWindow.loadURL(startUrl);

    // Show when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();

        if (windowState.isMaximized) {
            mainWindow.maximize();
        }

        // Open DevTools in development
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
    });

    // Save window state on close
    mainWindow.on('close', () => {
        windowState.isMaximized = mainWindow.isMaximized();

        if (!windowState.isMaximized) {
            const bounds = mainWindow.getBounds();
            windowState.width = bounds.width;
            windowState.height = bounds.height;
            windowState.x = bounds.x;
            windowState.y = bounds.y;
        }
    });

    // Cleanup on closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Prevent navigation away from app
    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (!url.startsWith(startUrl)) {
            event.preventDefault();
        }
    });

    // Create tray icon
    createTray();
}

/**
 * Create system tray icon
 */
function createTray() {
    const trayIcon = nativeImage.createFromPath(
        path.join(__dirname, 'icons', 'tray.png')
    );

    tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'DigiDhoodh',
            enabled: false,
        },
        { type: 'separator' },
        {
            label: 'Show App',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            },
        },
        {
            label: 'Dashboard',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                    mainWindow.webContents.send('navigate', '/dashboard');
                }
            },
        },
        {
            label: 'Add Milk Entry',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                    mainWindow.webContents.send('navigate', '/milk-entry');
                }
            },
        },
        { type: 'separator' },
        {
            label: 'Sync Now',
            click: () => {
                if (mainWindow) {
                    mainWindow.webContents.send('trigger-sync');
                }
            },
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                app.quit();
            },
        },
    ]);

    tray.setContextMenu(contextMenu);
    tray.setToolTip('DigiDhoodh - Dairy Management');

    // Show window on tray click
    tray.on('click', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.show();
                mainWindow.focus();
            }
        }
    });
}

/**
 * App ready - create window
 */
app.whenReady().then(() => {
    createWindow();

    // macOS: re-create window when dock icon clicked
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

/**
 * Quit when all windows closed (except macOS)
 */
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

/**
 * IPC Handlers
 */

// Get app version
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

// Get platform info
ipcMain.handle('get-platform-info', () => {
    return {
        platform: process.platform,
        arch: process.arch,
        version: process.getSystemVersion(),
        electronVersion: process.versions.electron,
        chromeVersion: process.versions.chrome,
    };
});

// Minimize to tray
ipcMain.on('minimize-to-tray', () => {
    if (mainWindow) {
        mainWindow.hide();
    }
});

// Show notification
ipcMain.on('show-notification', (event, { title, body }) => {
    if (mainWindow) {
        mainWindow.webContents.send('notification', { title, body });
    }
});

/**
 * Development: reload on changes
 */
if (isDev) {
    try {
        require('electron-reloader')(module, {
            debug: true,
            watchRenderer: false, // Next.js handles renderer reloading
        });
    } catch (err) {
        console.log('Error loading electron-reloader:', err);
    }
}

/**
 * Security: prevent new window creation
 */
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, url) => {
        event.preventDefault();
    });

    contents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });
});

/**
 * Disable hardware acceleration if needed
 */
// app.disableHardwareAcceleration();

console.log('🚀 DigiDhoodh Electron app starting...');
console.log(`Environment: ${isDev ? 'Development' : 'Production'}`);
console.log(`Platform: ${process.platform}`);
