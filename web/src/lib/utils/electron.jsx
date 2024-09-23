const isElectron = () => typeof window !== 'undefined' && window.isElectron === true;

const sendMessage = (channel, message) => {
    if (isElectron()) {
        try {
            if (window.electronAPI) {
                window.electronAPI.send(channel, message);
                console.log(`Sent message: ${channel}`);
            } else {
                console.error('Electron API is not available.');
            }
        } catch (error) {
            console.error(`Error sending message to Electron: ${error}`);
        }
    } else {
        console.log(`Not running in Electron: '${channel}' not sent.`);
    }
};

const checkWindowState = async () => {
    if (isElectron()) {
        try {
            if (window.electronAPI) {
                const state = await window.electronAPI.invoke('get-window-state');
                console.log(`Received window state: ${state}`);
                return state;
            } else {
                throw new Error('Electron API is not available.');
            }
        } catch (error) {
            console.error(`Error checking window state: ${error}`);
        }
    } else {
        console.error('Not running in Electron: Cannot check window state.');
    }
    return null;
};

export const minElectron = () => sendMessage('minimize-window');
export const maxElectron = async () => {
    try {
        const state = await checkWindowState();
        const command = state === 'maximized' ? 'restore-window' : 'maximize-window';
        sendMessage(command);
    } catch (error) {
        console.error(error);
    }
};

export const closeElectron = () => sendMessage('close-window');
export const windowStateElectron = async () => {
    try {
        const state = await checkWindowState();
        return state; // Directly return the state
    } catch (error) {
        console.error(error);
    }
};
