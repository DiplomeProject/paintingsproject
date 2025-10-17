import React, { useState } from "react";
import styles from "./Login.module.css";
import { EyeIcon, EyeSlashIcon, TwitterIcon, FacebookIcon, MailIcon } from "../Register/AuthIcons"; // Іконки винесемо в окремий файл

function Login({ toggleForm }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={styles.authCard}>
            <h2 className={styles.logo}>DIGITAL BRUSH</h2>

            <div className={styles.field}>
                <label htmlFor="login-email">Login</label>
                <input id="login-email" type="email" name="email" required />
            </div>

            <div className={styles.field}>
                <label htmlFor="login-password">Password</label>
                <div className={styles.passwordWrapper}>
                    <input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                    />
                    <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowPassword((s) => !s)}
                    >
                        {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                </div>
            </div>

            <button type="submit" className={styles.submitBtn}>Log in</button>

            <a href="#" className={styles.forgotPassword}>Password forgotten?</a>

            <button type="button" className={styles.switchFormBtn} onClick={toggleForm}>
                Create account
            </button>

            <div className={styles.divider}>OR</div>

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
    );
}

export default Login;