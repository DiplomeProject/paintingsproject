import React, { useState } from "react";
import styles from "./Register.module.css";
import { EyeIcon, EyeSlashIcon, TwitterIcon, FacebookIcon, MailIcon } from "./AuthIcons"; // Використовуємо ті ж іконки

function Register({ toggleForm }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={styles.authCard}>
            <div className={styles.title}>Registration via:</div>
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

            <div className={`${styles.title} ${styles.emailTitle}`}>Registration via email</div>

            <div className={styles.field}>
                <label htmlFor="reg-username">Username</label>
                <input id="reg-username" name="username" required />
            </div>
            <div className={styles.field}>
                <label htmlFor="reg-email">Email</label>
                <input id="reg-email" type="email" name="email" required />
            </div>
            <div className={styles.field}>
                <label htmlFor="reg-birthday">Birthday</label>
                <input id="reg-birthday" type="date" name="birthday" required />
            </div>
            <div className={styles.field}>
                <label htmlFor="reg-password">Password</label>
                <div className={styles.passwordWrapper}>
                    <input id="reg-password" name="password" type={showPassword ? "text" : "password"} required />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword((s) => !s)}>
                        {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                </div>
            </div>

            <button type="submit" className={styles.submitBtn}>Next</button>

            <button type="button" className={styles.switchFormBtn} onClick={toggleForm}>
                Already have an account? Log in
            </button>
        </div>
    );
}

export default Register;