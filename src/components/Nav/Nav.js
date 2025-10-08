import { useNavigate } from "react-router-dom";
import { useState, React } from "react";
// ОНОВЛЕНО: Імпортуємо стилі як модуль
import styles from "./Nav.module.css";

export function Navbar() {
    const [activeLink, setActiveLink] = useState("MAIN");
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        // ОНОВЛЕНО: Усі className тепер використовують об'єкт styles
        <nav className={styles.navbar}>
            <div className={styles.navbarMain}>
                <div className={styles.navbarContainer}>
                    <div className={styles.navbarLogo}>
                        <div className={styles.logoText}>Digital Brush</div>
                    </div>

                    <div className={styles.navbarLinks}>
                        <button
                            className={activeLink === "MAIN" ? styles.navButtonActive : styles.navLink}
                            onClick={() => {
                                setActiveLink("MAIN");
                                handleNavigation('/homepage');
                            }}
                        >
                            MAIN
                        </button>
                        <button
                            className={activeLink === "SHOP" ? styles.navButtonActive : styles.navLink}
                            onClick={() => {
                                setActiveLink("SHOP");
                                handleNavigation('/shop');
                            }}
                        >
                            SHOP
                        </button>
                        <button
                            className={activeLink === "ARTISTS" ? styles.navButtonActive : styles.navLink}
                            onClick={() => {
                                setActiveLink("ARTISTS");
                                handleNavigation('/');
                            }}
                        >
                            ARTISTS
                        </button>
                        <button
                            className={activeLink === "COMMISSION" ? styles.navButtonActive : styles.navLink}
                            onClick={() => {
                                setActiveLink("COMMISSION");
                                handleNavigation('/homepage');
                            }}
                        >
                            COMMISSION
                        </button>
                    </div>

                    <div className={styles.navbarRight}>
                        <div className={styles.languageSelector}>
                            <svg className={styles.languageIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                            </svg>
                            <span className={styles.navLanguage}>Eng</span>
                        </div>

                        <button className={styles.navSigninButton} onClick={() => {
                            setActiveLink("PROFILE");
                            handleNavigation('/profile');
                        }}>
                            SIGN IN/
                            <br />
                            PROFILE
                        </button>
                    </div>
                </div>

                <div className={styles.navbarBottomBorder} />
            </div>
        </nav>
    );
}

export default Navbar;