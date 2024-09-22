const { app, BrowserWindow } = require('electron');
const squirrelStartup = require('electron-squirrel-startup');
const { createWindow } = require('./src/window');
const { exec } = require('child_process');
const path = require('path');
const log = require('electron-log/main');
const asar = require('@electron/asar');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let apiProcess; // Variable to hold the API process
const isDev = process.env.NODE_ENV === 'development'; // Check if in development mode
const extractedPath = path.join(app.getPath('userData'), 'app'); // Path for extracted app files

// Exit if started by Squirrel
if (squirrelStartup) {
    app.quit();
}

// Setup logging for the autoUpdater
autoUpdater.logger = log;

// Event listener for when an update is available
autoUpdater.on('update-available', () => {
    log.info('Update available. Downloading...');
});

// Event listener for when the update has been downloaded
autoUpdater.on('update-downloaded', () => {
    log.info('Update downloaded. It will be installed on quit.');
});

// Event listener for errors during updates
autoUpdater.on('error', (error) => {
    log.error(`Update error: ${error}`);
});

// Function to extract the app.asar file
function extractAsar() {
    const asarPath = path.join(process.resourcesPath, 'app.asar');
    if (!fs.existsSync(extractedPath)) {
        log.info(`Extracting app.asar to ${extractedPath}`);
        asar.extractAll(asarPath, extractedPath); // Extract the ASAR file
        log.info(`Extraction complete.`);
    } else {
        log.info('Extraction skipped, app folder already exists.');
    }
}

// Start the API process
function startApi() {
    const apiPath = isDev
        ? `cd api && node index.js` // Development command
        : `node ${path.join(extractedPath, 'api', 'dist', 'api.bundle.js')}`; // Production command

    log.info(`Starting API from: ${apiPath}`);

    exec(apiPath, { env: { ...process.env, PORT: 3952 } }, (error, stdout, stderr) => {
        if (error) {
            log.error(`Error starting API: ${error}`);
            return;
        }
        log.info(`API stdout: ${stdout}`);
        log.error(`API stderr: ${stderr}`);
    });

    log.info(`API has been started on http://localhost:3952`);
}

// Start the React application
function startReact() {
    const reactPort = 3951;
    const reactPath = isDev
        ? 'cd web && npm run dev' // Development command
        : `npx serve -s ${path.join(extractedPath, 'web', 'dist')} -l ${reactPort}`; // Production command

    log.info(`Starting React from: ${reactPath}`);
    
    exec(reactPath, (error, stdout, stderr) => {
        if (error) {
            log.error(`Error starting React: ${error}`);
            return;
        }
        log.info(`React stdout: ${stdout}`);
        log.error(`React stderr: ${stderr}`);
    });

    log.info(`React has been started on http://localhost:${reactPort}`);
}

// Event when the app is ready
app.whenReady().then(() => {
    log.info("App is ready");
    !isDev && extractAsar(); // Extract ASAR in production mode
    createWindow(); // Create the main application window
    startApi(); // Start the API process
    startReact(); // Start the React application

    // Set GitHub feed URL for autoUpdater
    autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'lavion6191',
        repo: 'miya'
    });

    // Check for updates in production mode
    !isDev && autoUpdater.checkForUpdatesAndNotify();

    // Event when the app is activated (e.g., after being minimized)
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Event when all windows are closed
app.on('window-all-closed', () => {
    if (apiProcess) {
        apiProcess.kill(); // Kill the API process if running
    }
    if (process.platform !== 'darwin') {
        app.quit(); // Quit the app on non-macOS platforms
    }
});
