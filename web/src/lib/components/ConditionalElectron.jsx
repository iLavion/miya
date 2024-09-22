import PropTypes from 'prop-types';
import { useElectron } from '../context/ElectronContext';

export function ConditionalElectron ({ children }) {
    const isElectron = useElectron();

    return isElectron ? children : null;
};

ConditionalElectron.propTypes = {
    children: PropTypes.node
};

export function UnconditionalElectron ({ children }) {
    const isElectron = useElectron();

    return isElectron ? null : children;
};

UnconditionalElectron.propTypes = {
    children: PropTypes.node
};

