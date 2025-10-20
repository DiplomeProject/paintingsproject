import React, { useState } from "react";
import styles from "./ForgotPassword.module.css";
import { TwitterIcon, FacebookIcon, MailIcon } from "../../Register/AuthIcons";

function ForgotPassword({ onBack }) {
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Email for password reset:", email);
        alert(`Instructions have been sent to ${email}`);
    };

    return (
        <div className={styles.authCard}>
            <h2 className={styles.logo}>DIGITAL BRUSH</h2>
            <p className={styles.instructionText}>Enter your email to reset password</p>

            <form onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <label htmlFor="reset-email">Email</label>
                    <input
                        id="reset-email"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
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

export default ForgotPassword;