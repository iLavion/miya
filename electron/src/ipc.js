const { ipcMain } = require('electron');

let isMaximized = false;

function initializeIPC(mainWindow) {
    ipcMain.handle('get-window-state', () => {
        return isMaximized ? 'maximized' : 'normal';
    });

    ipcMain.on('maximize-window', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
            isMaximized = false;
        } else {
            mainWindow.maximize();
            isMaximized = true;
        }
        mainWindow.webContents.send('window-state', isMaximized ? 'maximized' : 'normal');
    });

    ipcMain.on('restore-window', () => {
        mainWindow.unmaximize();
        isMaximized = false;
        mainWindow.webContents.send('window-state', 'normal');
    });

    ipcMain.on('minimize-window', () => mainWindow.minimize());

    ipcMain.on('close-window', () => mainWindow.close());
}

module.exports = { initializeIPC };
