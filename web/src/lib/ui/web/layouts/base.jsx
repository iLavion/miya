import PropTypes from 'prop-types';
import styles from '@css/miya.module.css'
import { ConditionalElectron } from '@components/ConditionalElectron';
import Navigation from '@ui/electron/navigation';
import WebNavigation from '@ui/web/layouts/navigation';

export default function Base({ children }) {
    return (
        <div className={`${styles.myApp}`}>
            <ConditionalElectron>
                <Navigation />
            </ConditionalElectron>
            <WebNavigation />
            <main>
                {children}
            </main>
        </div>
    )
}

Base.propTypes = {
    children: PropTypes.node
};

export function VideoBase({ children }) {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
                {children}
            </main>
        </div>
    )
}

VideoBase.propTypes = {
    children: PropTypes.node
};

export function AnimeBase({ children }) {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
                {children}
            </main>
        </div>
    )
}

AnimeBase.propTypes = {
    children: PropTypes.node
};