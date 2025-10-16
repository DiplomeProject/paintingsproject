import { useNavigate, useLocation } from "react-router-dom";
import React, {useEffect, useState} from "react";
import styles from "./Nav.module.css";

export function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [isMenuOpen]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleNavigation = (path) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    const getButtonClass = (path, linkName) => {
        if (linkName === 'MAIN' && (location.pathname === '/' || location.pathname === '/homepage')) {
            return styles.navButtonActive;
        }
        if (location.pathname === path) {
            return styles.navButtonActive;
        }
        return styles.navLink;
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbarMain}>
                <div className={styles.navbarContainer}>
                    {/* ОНОВЛЕНО: Додано нову обгортку .navbarLeft */}
                    <div className={styles.navbarLeft}>
                        <div className={styles.navbarLogo}>
                            <div className={styles.logoText}>Digital Brush</div>
                        </div>

                        <div className={styles.navbarLinks}>
                            <button
                                className={getButtonClass('/homepage', 'MAIN')}
                                onClick={() => handleNavigation('/homepage')}
                            >
                                MAIN
                            </button>
                            <button
                                className={getButtonClass('/shop', 'SHOP')}
                                onClick={() => handleNavigation('/shop')}
                            >
                                SHOP
                            </button>
                            <button
                                className={getButtonClass('/artists', 'ARTISTS')}
                                onClick={() => handleNavigation('/artists')}
                            >
                                ARTISTS
                            </button>
                            <button
                                className={getButtonClass('/commission', 'COMMISSION')}
                                onClick={() => handleNavigation('/commission')}
                            >
                                COMMISSION
                            </button>
                        </div>
                    </div>

                    <div className={styles.navbarRight}>
                        <div className={styles.languageSelector}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="34" viewBox="0 0 32 34" fill="none">
                                <path d="M16 21.8002C18.636 21.8002 20.7729 19.6512 20.7729 17.0002C20.7729 14.3492 18.636 12.2002 16 12.2002C13.364 12.2002 11.2271 14.3492 11.2271 17.0002C11.2271 19.6512 13.364 21.8002 16 21.8002Z" stroke="white" stroke-width="1.5"/>
                                <path d="M18.8081 1.2432C18.2242 1 17.4828 1 16 1C14.5172 1 13.7758 1 13.1919 1.2432C12.8056 1.40402 12.4546 1.63983 12.1589 1.93716C11.8633 2.23448 11.6288 2.58749 11.4689 2.976C11.3225 3.3328 11.2637 3.7504 11.2414 4.3568C11.2315 4.79518 11.1109 5.22384 10.8911 5.60251C10.6712 5.98118 10.3593 6.29745 9.98453 6.5216C9.60412 6.73607 9.17574 6.84976 8.73964 6.852C8.30354 6.85424 7.87403 6.74495 7.49147 6.5344C6.9569 6.2496 6.57029 6.0928 6.18687 6.0416C5.35053 5.93099 4.50473 6.15889 3.83541 6.6752C3.33584 7.064 2.96356 7.7088 2.22216 9C1.48077 10.2912 1.10848 10.936 1.02734 11.568C0.972667 11.9847 1.00017 12.4082 1.10827 12.8142C1.21637 13.2203 1.40296 13.6009 1.65737 13.9344C1.89283 14.2416 2.22216 14.4992 2.73287 14.8224C3.4854 15.2976 3.96905 16.1072 3.96905 17C3.96905 17.8928 3.4854 18.7024 2.73287 19.176C2.22216 19.5008 1.89124 19.7584 1.65737 20.0656C1.40296 20.3991 1.21637 20.7797 1.10827 21.1858C1.00017 21.5918 0.972667 22.0153 1.02734 22.432C1.11007 23.0624 1.48077 23.7088 2.22057 25C2.96356 26.2912 3.33425 26.936 3.83541 27.3248C4.16703 27.5807 4.54552 27.7683 4.94926 27.877C5.353 27.9857 5.77409 28.0134 6.18846 27.9584C6.5703 27.9072 6.9569 27.7504 7.49147 27.4656C7.87403 27.255 8.30354 27.1458 8.73964 27.148C9.17574 27.1502 9.60412 27.2639 9.98453 27.4784C10.753 27.9264 11.2096 28.7504 11.2414 29.6432C11.2637 30.2512 11.3209 30.6672 11.4689 31.024C11.6288 31.4125 11.8633 31.7655 12.1589 32.0628C12.4546 32.3602 12.8056 32.596 13.1919 32.7568C13.7758 33 14.5172 33 16 33C17.4828 33 18.2242 33 18.8081 32.7568C19.1944 32.596 19.5454 32.3602 19.8411 32.0628C20.1367 31.7655 20.3712 31.4125 20.5311 31.024C20.6775 30.6672 20.7363 30.2512 20.7586 29.6432C20.7904 28.7504 21.247 27.9248 22.0155 27.4784C22.3959 27.2639 22.8243 27.1502 23.2604 27.148C23.6965 27.1458 24.126 27.255 24.5085 27.4656C25.0431 27.7504 25.4297 27.9072 25.8115 27.9584C26.2259 28.0134 26.647 27.9857 27.0507 27.877C27.4545 27.7683 27.833 27.5807 28.1646 27.3248C28.6657 26.9376 29.0364 26.2912 29.7778 25C30.5192 23.7088 30.8915 23.064 30.9727 22.432C31.0273 22.0153 30.9998 21.5918 30.8917 21.1858C30.7836 20.7797 30.597 20.3991 30.3426 20.0656C30.1072 19.7584 29.7778 19.5008 29.2671 19.1776C28.8944 18.9498 28.5854 18.6304 28.3692 18.2495C28.1529 17.8686 28.0366 17.4386 28.0309 17C28.0309 16.1072 28.5146 15.2976 29.2671 14.824C29.7778 14.4992 30.1088 14.2416 30.3426 13.9344C30.597 13.6009 30.7836 13.2203 30.8917 12.8142C30.9998 12.4082 31.0273 11.9847 30.9727 11.568C30.8899 10.9376 30.5192 10.2912 29.7794 9C29.0364 7.7088 28.6657 7.064 28.1646 6.6752C27.833 6.41935 27.4545 6.2317 27.0507 6.12299C26.647 6.01427 26.2259 5.98662 25.8115 6.0416C25.4297 6.0928 25.0431 6.2496 24.5069 6.5344C24.1246 6.74466 23.6954 6.8538 23.2596 6.85156C22.8238 6.84932 22.3957 6.73578 22.0155 6.5216C21.6407 6.29745 21.3288 5.98118 21.1089 5.60251C20.8891 5.22384 20.7685 4.79518 20.7586 4.3568C20.7363 3.7488 20.6791 3.3328 20.5311 2.976C20.3712 2.58749 20.1367 2.23448 19.8411 1.93716C19.5454 1.63983 19.1944 1.40402 18.8081 1.2432Z" stroke="white" stroke-width="1.5"/>
                            </svg>
                            <span className={styles.navLanguage}>Eng</span>
                        </div>

                        <button
                            className={getButtonClass('/profile', 'PROFILE')}
                            onClick={() => handleNavigation('/profile')}
                        >
                            SIGN IN/
                            <br />
                            PROFILE
                        </button>
                    </div>

                    <button className={`${styles.burgerMenu} ${isMenuOpen ? styles.hidden : ''}`} onClick={toggleMenu}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div className={styles.navbarBottomBorder} />
            </div>

            <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
                <button className={styles.closeButton} onClick={toggleMenu}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <div className={styles.mobileNavLinks}>
                    <button onClick={() => handleNavigation('/homepage')}>MAIN</button>
                    <button onClick={() => handleNavigation('/shop')}>SHOP</button>
                    <button onClick={() => handleNavigation('/artists')}>ARTISTS</button>
                    <button onClick={() => handleNavigation('/commission')}>COMMISSION</button>
                    <button onClick={() => handleNavigation('/profile')}>SIGN IN / PROFILE</button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;