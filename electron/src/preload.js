// electron/src/preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
    on: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => callback(...args)),
    off: (channel, listener) => ipcRenderer.off(channel, listener)
});

// Expose flag 
contextBridge.exposeInMainWorld('isElectron', true);
