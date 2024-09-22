import { createContext, useContext, useEffect, useState } from 'react';
import isElectron from '../utils/isElectron'

// Create the Electron Context
const ElectronContext = createContext(false);

// Electron Provider Component
export const ElectronProvider = ({ children }) => {
    const [isRunningInElectron, setIsRunningInElectron] = useState(false);

    useEffect(() => {
        const result = isElectron();
        setIsRunningInElectron(result);
    }, []);

    return (
        <ElectronContext.Provider value={isRunningInElectron}>
            {children}
        </ElectronContext.Provider>
    );
};

// Custom Hook to use Electron context
export const useElectron = () => {
    return useContext(ElectronContext);
};