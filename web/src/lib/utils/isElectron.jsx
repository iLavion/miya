// src/utils/isElectron.jsx

export default function isElectron() {
    if (typeof window === 'undefined') {
        console.log("Not Electron: 'window' is undefined.");
        return false;
    }
    if (window.isElectron !== true) {
        console.log("Not Electron: 'window.isElectron' is not true.");
        return false;
    }
    console.log("Running in Electron: 'window.isElectron' is true.");
    return true;
};
