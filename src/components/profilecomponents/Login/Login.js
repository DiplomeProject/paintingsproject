import React, { useState } from "react";
import styles from "./Login.module.css";
import { EyeIcon, EyeSlashIcon, TwitterIcon, FacebookIcon, MailIcon } from "../Register/AuthIcons"; // Іконки винесемо в окремий файл

function Login({ toggleForm, handleLogin, handleInputChange, onForgotPassword }) {
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        handleLogin(e);
    };

    return (
        <form className={styles.authCard} onSubmit={handleSubmit}>
            <h2 className={styles.logo}>DIGITAL BRUSH</h2>

            <div className={styles.field}>
                <label htmlFor="login-email">Login</label>
                <input
                    id="login-email"
                    type="email"
                    name="email" // Ім'я поля має відповідати стану в Profile.js
                    onChange={handleInputChange} // Використовуємо обробник з Profile.js
                    required
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="login-password">Password</label>
                <div className={styles.passwordWrapper}>
                    <input
                        id="login-password"
                        name="password" // Ім'я поля має відповідати стану в Profile.js
                        type={showPassword ? "text" : "password"}
                        onChange={handleInputChange} // Використовуємо обробник з Profile.js
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

            {/* Кнопка для переходу до відновлення пароля */}
            <a type="button" className={styles.forgotPassword} onClick={onForgotPassword}>
                Password forgotten?
            </a>

            {/* Кнопка для переходу до реєстрації */}
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
        </form>
    );
}

export default Login;