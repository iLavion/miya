// src/lib/ui/electron/Navigation.jsx
import { useEffect, useState } from 'react';
import { MaterialSymbol } from 'react-material-symbols';
import { minElectron, maxElectron, closeElectron, windowStateElectron } from '@utils/electron';
import Logo from '@assets/miya_cropped.png';
import styles from '@css/electron.module.css';
import { ConditionalElectron } from '@components/ConditionalElectron';

export default function Navigation() {
    const [isMaximized, setIsMaximized] = useState(false);
    const [hoverClose, setHoverClose] = useState(false);
    const [hoverMax, setHoverMax] = useState(false);
    const [hoverMin, setHoverMin] = useState(false)
    const size = 20;

    useEffect(() => {
        const fetchWindowState = async () => {
            try {
                const state = await windowStateElectron();
                //console.log('Window state:', state);
                setIsMaximized(state === 'maximized')
            } catch (error) {
                console.error('Failed to fetch window state:', error);
            }
        };

        fetchWindowState();

        if (window.electronAPI) {
            window.electronAPI.on('window-state', (state) => {
                //console.log('Window state:', state);
                setIsMaximized(state === 'maximized');
            });
        }
    }, []);

    return (
        <nav className={`${styles.electronNavigation}`}>
            <ConditionalElectron>
                <div className={`${styles.electronLogo}`}>
                    <img src={Logo} alt="" />
                </div>
            </ConditionalElectron>
            <div className={`${styles.electronDragSpace} drag`} />
            <div
                onClick={minElectron}
                className={`${styles.electronButton} ${styles.electronMinimize}`}
                onMouseEnter={() => setHoverMin(true)}
                onMouseLeave={() => setHoverMin(false)}
            >
                <MaterialSymbol
                    icon="minimize"
                    size={size}
                    fill
                    color={hoverMin ? '#fff' : 'var(--Quantum2)'}
                />
            </div>
            <div
                onClick={maxElectron}
                className={`${styles.electronButton} ${styles.electronMaximize}`}
                onMouseEnter={() => setHoverMax(true)}
                onMouseLeave={() => setHoverMax(false)}
            >
                <MaterialSymbol
                    icon={isMaximized ? "select_window" : "web_asset"}
                    size={size}
                    fill
                    color={hoverMax ? '#fff' : 'var(--Quantum2)'}
                />
            </div>
            <div
                onClick={closeElectron}
                className={`${styles.electronButton} ${styles.electronClose}`}
                onMouseEnter={() => setHoverClose(true)}
                onMouseLeave={() => setHoverClose(false)}
            >
                <MaterialSymbol
                    icon="close"
                    size={size}
                    fill
                    color={hoverClose ? '#fff' : 'var(--Quantum2)'}
                />
            </div>
        </nav>
    );
}
