import React from 'react';
import styles from './Footer.module.css';
import twitterIcon from '../../assets/twitterIcon.svg';
import instagramIcon from '../../assets/instagram-icon.svg';
import facebookIcon from '../../assets/facebook-icon.svg';

/*
 * Цей компонент SocialIcon використовує <img> теги,
 * щоб показувати повноколірні логотипи.
*/
const SocialIcon = ({ type }) => {
    const icons = {
        twitter: twitterIcon,
        facebook: facebookIcon,
        instagram: instagramIcon,
    };

    return (
        <a href="#" className={styles.socialIconLink}>
            <img
                src={icons[type]}
                alt={`${type} logo`}
                className={styles.socialIcon}
            />
        </a>
    );
};


function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerTop}>
                <div className={styles.footerContainer}>
                    <div className={styles.footerLeft}>
                        <div className={styles.footerLogo}>Digital Brush</div>
                        <p className={styles.footerText}>
                            This is a space that unites artists and customers,
                            ensures transparency, security, and convenience
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
            </div>

            <div className={styles.footerBottom}>
                <p>2025</p>
            </div>
        </footer>
    );
}

export default Footer;