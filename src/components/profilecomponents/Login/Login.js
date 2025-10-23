import React, { useState } from "react";
import styles from "./Login.module.css";
import { EyeIcon, EyeSlashIcon } from "../Register/AuthIcons"; // Видалено непотрібні іконки

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
                    name="email"
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="login-password">Password</label>
                <div className={styles.passwordWrapper}>
                    <input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        onChange={handleInputChange}
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

            <a type="button" className={styles.forgotPassword} onClick={onForgotPassword}>
                Password forgotten?
            </a>

            <button type="button" className={styles.switchFormBtn} onClick={toggleForm}>
                Create account
            </button>
        </form>
    );
}

export default Login;