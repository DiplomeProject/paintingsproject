import React, { useState } from "react";
import styles from "./ForgotPassword.module.css";

function ForgotPassword({ onBack, toggleForm }) {
    const [email, setEmail] = useState("");

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        console.log("Email for password reset:", email);
        // Здесь будет запрос на отправку кода
    };

    const handleCreateAccount = () => {
        if (toggleForm && typeof toggleForm === 'function') {
            toggleForm();
        } else {
            console.log("Toggle form function is not available");
        }
    };

    return (
        <div className={styles.authCard}>
            <h2 className={styles.logo}>Digital<br />Brush</h2>

            <div className={styles.emailContainer}>
                <form onSubmit={handleEmailSubmit}>
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
            </div>

            {/* Чёрная полоска */}
            <div className={styles.separator}></div>

            {/* Кнопка Create account */}
            <button
                type="button"
                className={styles.createAccountBtn}
                onClick={handleCreateAccount}
            >
                Create account
            </button>
        </div>
    );
}

export default ForgotPassword;