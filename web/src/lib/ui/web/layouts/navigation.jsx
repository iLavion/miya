import styles from '@css/miya.module.css'
import logo from '@assets/miya_cropped.png'
import { UnconditionalElectron } from '@components/ConditionalElectron';

export default function Navigation() {
    return (
        <nav className={styles.myWebNav}>
            {/* Logo */}
            <UnconditionalElectron>
                <img src={logo} alt="Logo" className={styles.myWebNavLogo} />
            </UnconditionalElectron>

            {/* Search */}
            <div className={styles.myWebNavSearch}>
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className={styles.searchInput}
                />
                <button className={styles.searchButton}>🔍</button>
            </div>

            {/* Menu */}
            <div>

            </div>
        </nav>
    )
}