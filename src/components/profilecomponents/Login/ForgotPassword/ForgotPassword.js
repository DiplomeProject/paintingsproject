import React, { useState } from "react";
import styles from "../AuthComponent/AuthForm.module.css";
import AuthLayout from "../AuthComponent/AuthForm"; 

function ForgotPassword({ onBack, toggleForm }) {
    const [email, setEmail] = useState("");

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        console.log("Email for password reset:", email);
    };

    return (
        // 3. Використовуємо обгортку
        <AuthLayout onCreateAccount={toggleForm}>

            {/* 4. <form> всередині */}
            <form className={styles.formContainer} onSubmit={handleEmailSubmit}>
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

                <div className={styles.actionsRow}>
                    {/* Використовуємо нові уніфіковані класи */}
                    <button type="submit" className={styles.primaryBtn}>
                        Send mail
                    </button>
                    <button
                        type="button"
                        className={styles.primaryBtn} // <-- Зробимо її теж синьою
                        onClick={onBack}
                    >
                        Back
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
}

export default ForgotPassword;