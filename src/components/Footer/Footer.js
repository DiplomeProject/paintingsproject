import React from 'react';
import styles from './Footer.module.css';

// Простой компонент для SVG иконок, чтобы не усложнять.
// В реальном проекте лучше использовать библиотеку вроде react-icons.
const SocialIcon = ({ type }) => {
    const icons = {
        twitter: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.67.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98-3.56-.18-6.73-1.89-8.84-4.48-.37.63-.58 1.37-.58 2.15 0 1.49.76 2.8 1.91 3.56-.71 0-1.37-.22-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.52 8.52 0 0 1-5.33 1.84c-.34 0-.68-.02-1.01-.06A12.07 12.07 0 0 0 6.4 18c7.65 0 11.84-6.35 11.84-11.84 0-.18 0-.36-.01-.54A8.45 8.45 0 0 0 24 6.3z" /></svg>,
        facebook: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-1 0-1.5.5-1.5 1.5V12h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z" /></svg>,
        instagram: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c2.72 0 3.05.01 4.12.06 1.06.05 1.79.22 2.42.46.65.25 1.13.59 1.62 1.08.49.49.83.97 1.08 1.62.24.63.41 1.36.46 2.42.05 1.07.06 1.4.06 4.12s-.01 3.05-.06 4.12c-.05 1.06-.22 1.79-.46 2.42a4.88 4.88 0 0 1-1.08 1.62c-.49.49-.97.83-1.62 1.08-1.28.48-4.16.48-5.46 0-.65-.25-1.13-.59-1.62-1.08a4.88 4.88 0 0 1-1.08-1.62c-.24-.63-.41-1.36-.46-2.42C2.96 15.05 2.95 14.72 2.95 12s.01-3.05.06-4.12c.05-1.06.22-1.79.46-2.42.25-.65.59-1.13 1.08-1.62.49-.49.97-.83 1.62-1.08.63-.24 1.36-.41 2.42-.46C8.95 2.01 9.28 2 12 2zm0-2C9.14 0 8.77.01 7.68.06c-1.14.05-1.98.23-2.73.52-.77.29-1.44.7-2.09 1.35S1.41 3.84 1.12 4.61c-.29.75-.47 1.59-.52 2.73C.01 8.23 0 8.6 0 11.46s.01 3.23.06 4.32c.05 1.14.23 1.98.52 2.73.29.77.7 1.44 1.35 2.09s1.32.96 2.09 1.25c.75.29 1.59.47 2.73.52 1.09.05 1.46.06 4.32.06s3.23-.01 4.32-.06c1.14-.05 1.98-.23 2.73-.52.77-.29 1.44-.7 2.09-1.25s.96-1.32 1.25-2.09c.29-.75.47-1.59.52-2.73.05-1.09.06-1.46.06-4.32s-.01-3.23-.06-4.32c-.05-1.14-.23-1.98-.52-2.73-.29-.77-.7-1.44-1.35-2.09s-1.32-.96-2.09-1.25c-.75-.29-1.59-.47-2.73-.52C15.23.01 14.86 0 12 0zm0 5.88a6.12 6.12 0 1 0 0 12.24 6.12 6.12 0 0 0 0-12.24zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0-2.88 1.44 1.44 0 0 0 0 2.88z"/></svg>
    };
    return <a href="#" className={styles.socialIcon}>{icons[type]}</a>;
};


function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContainer}>
                <div className={styles.footerLeft}>
                    <div className={styles.footerLogo}>Digital Brush</div>
                    <p className={styles.footerText}>
                        This is a space that unites artists and customers,
                        ensures convenience, security, and convenience
                        of collaboration, promotes the development of the
                        creative economy and supports digital culture.
                    </p>
                </div>
                <div className={styles.footerRight}>
                    <div className={styles.footerContact}>
                        <p>Contact us if you have any problems:</p>
                        <a href="mailto:digital_brush@gmail.com">digital_brush@gmail.com</a>
                    </div>
                    <div className={styles.footerSocial}>
                        <p>Follow us:</p>
                        <div className={styles.socialIconsContainer}>
                            <SocialIcon type="twitter" />
                            <SocialIcon type="facebook" />
                            <SocialIcon type="instagram" />
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.footerBottom}>
                <p>2025</p>
            </div>
        </footer>
    );
}

export default Footer;