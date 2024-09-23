const { ipcMain } = require('electron');

let isMaximized = false;

function initializeIPC(mainWindow) {
    ipcMain.handle('get-window-state', () => {
        return isMaximized ? 'maximized' : 'normal';
    });

    ipcMain.on('maximize-window', () => {
        if (!isMaximized) {
            mainWindow.maximize();
            isMaximized = true;
            mainWindow.webContents.send('window-state', 'maximized');
        }
    });

    ipcMain.on('restore-window', () => {
        if (isMaximized) {
            mainWindow.unmaximize();
            isMaximized = false;
            mainWindow.webContents.send('window-state', 'normal');
        }
    });

    ipcMain.on('minimize-window', () => mainWindow.minimize());

    ipcMain.on('close-window', () => mainWindow.close());

    // Update state on maximize/unmaximize events
    mainWindow.on('maximize', () => {
        isMaximized = true;
        mainWindow.webContents.send('window-state', 'maximized');
    });

    mainWindow.on('unmaximize', () => {
        isMaximized = false;
        mainWindow.webContents.send('window-state', 'normal');
    });

    mainWindow.on('resize', () => {
        const state = mainWindow.isMaximized() ? 'maximized' : 'normal';
        if (state !== (isMaximized ? 'maximized' : 'normal')) {
            isMaximized = state === 'maximized';
            mainWindow.webContents.send('window-state', state);
        }
    });
}

module.exports = { initializeIPC };
