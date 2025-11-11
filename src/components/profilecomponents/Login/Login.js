import React, { useState } from "react";
import styles from "./Login.module.css";
import { EyeIcon, EyeSlashIcon } from "../Register/AuthIcons";

function Login({ toggleForm, handleLogin, handleInputChange, onForgotPassword }) {
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        handleLogin(e);
    };

    return (
        <form className={styles.authCard} onSubmit={handleSubmit}>
            <h2 className={styles.logo}>Digital<br />Brush</h2>

            <div className={styles.fieldsContainer}>
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
            </div>

            <div className={styles.buttonsRow}>
                <button type="submit" className={styles.submitBtn}>
                    Log in
                </button>
                <a
                    type="button"
                    className={styles.forgotPassword}
                    onClick={onForgotPassword}
                >
                    Password forgotten?
                </a>
            </div>

            <div className={styles.bottomContainer}>
                <div className={styles.separator}></div>
                <button type="button" className={styles.switchFormBtn} onClick={toggleForm}>
                    Create account
                </button>
            </div>
        </form>
    );
}

export default Login;