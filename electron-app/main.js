// Enhanced Electron Main Process
// DigiDhoodh Desktop App - Production Ready

const { app, BrowserWindow, Menu, Tray, ipcMain, shell, nativeImage, Notification, protocol, net } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

let mainWindow = null
let tray = null
let isQuitting = false

// Check if app is available
if (!app) {
    console.error('Electron "app" object is undefined. Ensure you are running with the electron binary.')
    process.exit(1)
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })
}

// Register custom protocol
protocol.handle('app', (request) => {
    const url = request.url.replace(/^app:\/\/./, '')
    // Decode URL to handle spaces and special characters
    const decodedUrl = decodeURIComponent(url)

    // Remove query parameters/hash if any (although unusual for static assets)
    const cleanUrl = decodedUrl.split('?')[0].split('#')[0]

    // Determine file path
    // If it ends with /, look for index.html
    // If it has no extension, look for .html (Next.js route behavior)
    let filePath
    if (cleanUrl === '' || cleanUrl.endsWith('/')) {
        filePath = path.join(__dirname, '../out', cleanUrl, 'index.html')
    } else if (!path.extname(cleanUrl)) {
        filePath = path.join(__dirname, '../out', cleanUrl + '.html')
    } else {
        filePath = path.join(__dirname, '../out', cleanUrl)
    }

    return net.fetch('file://' + filePath)
})

// Create the browser window
mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'DigiDhoodh - Dairy Management',
    icon: path.join(__dirname, '../public/icon.png'),
    backgroundColor: '#f8fafc',
    webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        spellcheck: false,
        devTools: isDev,
    },
    show: false, // Don't show until ready
    titleBarStyle: 'default',
    autoHideMenuBar: false,
})

// Load the app
const startUrl = isDev
    ? 'http://localhost:3000'
    : 'app://./index.html'

mainWindow.loadURL(startUrl)

// Show window when ready
mainWindow.once('ready-to-show', () => {
    mainWindow.show()

    // Show startup notification
    if (Notification.isSupported()) {
        new Notification({
            title: 'DigiDhoodh Ready',
            body: 'Application started successfully!',
            icon: path.join(__dirname, '../public/icon.png'),
        }).show()
    }
})

// Open DevTools in development
if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
}

// Handle external links
mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
})

// Handle window close
mainWindow.on('close', (event) => {
    if (!isQuitting) {
        event.preventDefault()
        mainWindow.hide()

        if (Notification.isSupported()) {
            new Notification({
                title: 'DigiDhoodh',
                body: 'App is running in background. Click tray icon to open.',
                icon: path.join(__dirname, '../public/icon.png'),
            }).show()
        }
        return false
    }
    return true
})

mainWindow.on('closed', () => {
    mainWindow = null
})

// Create menu
createMenu()

// Create tray
createTray()
}

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Collection',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => mainWindow.webContents.send('menu-new-collection')
                },
                {
                    label: 'Print',
                    accelerator: 'CmdOrCtrl+P',
                    click: () => mainWindow.webContents.send('menu-print')
                },
                { type: 'separator' },
                {
                    label: 'Settings',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => mainWindow.loadURL(isDev ? 'http://localhost:3000/dashboard/settings' : 'file://...')
                },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Dashboard',
                    accelerator: 'CmdOrCtrl+D',
                    click: () => mainWindow.loadURL(isDev ? 'http://localhost:3000/dashboard' : 'file://...')
                },
                {
                    label: 'Milk Collection',
                    accelerator: 'CmdOrCtrl+M',
                    click: () => mainWindow.loadURL(isDev ? 'http://localhost:3000/dashboard/milk' : 'file://...')
                },
                {
                    label: 'Farmers',
                    accelerator: 'CmdOrCtrl+F',
                    click: () => mainWindow.loadURL(isDev ? 'http://localhost:3000/dashboard/farmers' : 'file://...')
                },
                { type: 'separator' },
                { role: 'reload' },
                { role: 'forceReload' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Tools',
            submenu: [
                {
                    label: 'Sync Data',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => mainWindow.webContents.send('menu-sync')
                },
                {
                    label: 'Connect Printer',
                    click: () => mainWindow.webContents.send('menu-connect-printer')
                },
                {
                    label: 'Connect Scanner',
                    click: () => mainWindow.webContents.send('menu-connect-scanner')
                },
                { type: 'separator' },
                {
                    label: 'Export Data',
                    click: () => mainWindow.webContents.send('menu-export')
                },
                {
                    label: 'Backup',
                    click: () => mainWindow.webContents.send('menu-backup')
                }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Documentation',
                    click: () => shell.openExternal('https://digidhoodh.com/docs')
                },
                {
                    label: 'Contact Support',
                    click: () => shell.openExternal('https://digidhoodh.com/support')
                },
                { type: 'separator' },
                {
                    label: 'Check for Updates',
                    click: () => mainWindow.webContents.send('menu-check-updates')
                },
                { type: 'separator' },
                {
                    label: 'About DigiDhoodh',
                    click: () => {
                        const { dialog } = require('electron')
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About DigiDhoodh',
                            message: 'DigiDhoodh - Dairy Management System',
                            detail: `Version: 2.0.0\nPlatform: ${process.platform}\nElectron: ${process.versions.electron}\nNode: ${process.versions.node}`,
                            buttons: ['OK']
                        })
                    }
                }
            ]
        }
    ]

    if (isDev) {
        template.push({
            label: 'Developer',
            submenu: [
                { role: 'toggleDevTools' },
                {
                    label: 'Clear Cache',
                    click: () => {
                        mainWindow.webContents.session.clearCache()
                    }
                }
            ]
        })
    }

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

function createTray() {
    const iconPath = path.join(__dirname, '../public/icon.png')
    const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })

    tray = new Tray(icon)

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open DigiDhoodh',
            click: () => {
                mainWindow.show()
            }
        },
        {
            label: 'Quick Collection',
            click: () => {
                mainWindow.show()
                mainWindow.webContents.send('menu-new-collection')
            }
        },
        { type: 'separator' },
        {
            label: 'Sync Now',
            click: () => {
                mainWindow.webContents.send('menu-sync')
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                isQuitting = true
                app.quit()
            }
        }
    ])

    tray.setToolTip('DigiDhoodh - Dairy Management')
    tray.setContextMenu(contextMenu)

    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    })

    tray.on('double-click', () => {
        mainWindow.show()
    })
}

// IPC Handlers
ipcMain.handle('get-app-info', () => ({
    version: app.getVersion(),
    platform: process.platform,
    electron: process.versions.electron,
    node: process.versions.node,
}))

ipcMain.handle('show-notification', (_, { title, body }) => {
    if (Notification.isSupported()) {
        new Notification({
            title,
            body,
            icon: path.join(__dirname, '../public/icon.png')
        }).show()
    }
})

ipcMain.handle('print-receipt', async (_, data) => {
    // Handle printing
    const printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        }
    })

    await printWindow.loadURL(`data:text/html,${encodeURIComponent(data.html)}`)

    printWindow.webContents.print({
        silent: data.silent || false,
        printBackground: true,
        margins: { marginType: 'minimum' }
    }, (success, reason) => {
        printWindow.close()
        if (!success) {
            console.error('Print failed:', reason)
        }
    })
})

// App lifecycle
app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    } else {
        mainWindow.show()
    }
})

app.on('before-quit', () => {
    isQuitting = true
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error)
})
