// ForgotPassword.js
import React, { useState } from "react";
import styles from "./ForgotPassword.module.css";
import { TwitterIcon, FacebookIcon, MailIcon } from "../Register/AuthIcons";

function ForgotPassword({ toggleForm, onBack }) {
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Здесь будет логика отправки email для восстановления пароля
        console.log("Email for password reset:", email);
        alert(`Instructions have been sent to ${email}`);
    };

    return (
        <div className={styles.authCard}>
            <h2 className={styles.logo}>DIGITAL BRUSH</h2>

            <form onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <label htmlFor="reset-email">Email</label>
                    <input
                        id="reset-email"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.actions}>
                    <button type="submit" className={styles.submitBtn}>
                        Send mail
                    </button>
                    <button
                        type="button"
                        className={styles.backBtn}
                        onClick={onBack}
                    >
                        Back
                    </button>
                </div>
            </form>

            <div className={styles.contactInfo}>
                <p>Contact us if you have any problems:</p>
                <a href="mailto:digital.brush@gmail.com" className={styles.emailLink}>
                    digital.brush@gmail.com
                </a>
            </div>

            <div className={styles.socialSection}>
                <p>Follow us:</p>
                <div className={styles.socialLogin}>
                    <button type="button" className={`${styles.socialButton} ${styles.twitter}`}>
                        <TwitterIcon />
                    </button>
                    <button type="button" className={`${styles.socialButton} ${styles.facebook}`}>
                        <FacebookIcon />
                    </button>
                    <button type="button" className={`${styles.socialButton} ${styles.mail}`}>
                        <MailIcon />
                    </button>
                </div>
            </div>

            <div className={styles.description}>
                <p>This is a space that works for artists and customers, ensures transparency, security, and convenience of collaboration; promotes the development of the creative economy and supports digital culture.</p>
            </div>

            <div className={styles.footer}>
                <p>2025</p>
            </div>
        </div>
    );
}

export default ForgotPassword;