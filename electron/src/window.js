const { BrowserWindow } = require('electron');
const path = require('path');
const { initializeIPC } = require('./ipc');

let mainWindow;
let isMaximized = false;

const isDev = process.env.NODE_ENV === 'development';
const reactPort = 3951;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'miya.png'),
        resizable: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        frame: false,
    });

    mainWindow.loadURL(`http://localhost:${reactPort}/anime`);

    // Maximize/unmaximize events
    mainWindow.on('maximize', () => {
        isMaximized = true;
        mainWindow.webContents.send('window-state', 'maximized');
    });

    mainWindow.on('unmaximize', () => {
        isMaximized = false;
        mainWindow.webContents.send('window-state', 'normal');
    });

    // Minimize event
    mainWindow.on('minimize', () => {
        isMaximized = false;
        mainWindow.webContents.send('window-minimized');
    });

    // Resize event
    mainWindow.on('resize', () => {
        const isCurrentlyMaximized = mainWindow.isMaximized();
        if (isCurrentlyMaximized !== isMaximized) {
            isMaximized = isCurrentlyMaximized;
            mainWindow.webContents.send('window-state', isMaximized ? 'maximized' : 'normal');
        }
    });

    // Initialize
    initializeIPC(mainWindow, isMaximized);
}

module.exports = { createWindow };