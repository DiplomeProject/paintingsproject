import React, { useState } from "react";
import styles from "./ForgotPassword.module.css";

function ForgotPassword({ onBack }) {
    const [step, setStep] = useState(1); // 1 - email, 2 - code, 3 - new password
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        console.log("Email for password reset:", email);
        // Тут буде запит на відправку коду
        setStep(2);
    };

    const handleCodeSubmit = (e) => {
        e.preventDefault();
        console.log("Verification code:", code);
        // Тут буде перевірка коду
        setStep(3);
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        console.log("New password:", newPassword);
        alert("Password has been reset successfully!");
        onBack(); // Повертаємось до логіну
    };

    // Форма для email
    if (step === 1) {
        return (
            <div className={styles.authCard}>
                <h2 className={styles.logo}>DIGITAL BRUSH</h2>

                <form onSubmit={handleEmailSubmit}>
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
            </div>
        );
    }

    // Форма для коду підтвердження
    if (step === 2) {
        return (
            <div className={styles.authCard}>
                <h2 className={styles.logo}>DIGITAL BRUSH</h2>
                <p className={styles.instructionText}>Enter verification code sent to {email}</p>

                <form onSubmit={handleCodeSubmit}>
                    <div className={styles.field}>
                        <label htmlFor="verification-code">Verification Code</label>
                        <input
                            id="verification-code"
                            type="text"
                            name="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter 6-digit code"
                            required
                            maxLength={6}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="submit" className={styles.submitBtn}>
                            Verify code
                        </button>
                        <button
                            type="button"
                            className={styles.backBtn}
                            onClick={() => setStep(1)}
                        >
                            Back
                        </button>
                    </div>
                </form>

                <p className={styles.resendText}>
                    Didn't receive the code? <span className={styles.resendLink}>Resend</span>
                </p>
            </div>
        );
    }

    // Форма для нового пароля
    return (
        <div className={styles.authCard}>
            <h2 className={styles.logo}>DIGITAL BRUSH</h2>
            <p className={styles.instructionText}>Create new password</p>

            <form onSubmit={handlePasswordSubmit}>
                <div className={styles.field}>
                    <label htmlFor="new-password">New Password</label>
                    <div className={styles.passwordWrapper}>
                        <input
                            id="new-password"
                            type={showPassword ? "text" : "password"}
                            name="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                        />
                        <button
                            type="button"
                            className={styles.eyeBtn}
                            onClick={() => setShowPassword((s) => !s)}
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>
                </div>

                <div className={styles.field}>
                    <label htmlFor="confirm-password">Confirm Password</label>
                    <div className={styles.passwordWrapper}>
                        <input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                        />
                        <button
                            type="button"
                            className={styles.eyeBtn}
                            onClick={() => setShowConfirmPassword((s) => !s)}
                        >
                            {showConfirmPassword ? "🙈" : "👁️"}
                        </button>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="submit" className={styles.submitBtn}>
                        Reset password
                    </button>
                    <button
                        type="button"
                        className={styles.backBtn}
                        onClick={() => setStep(2)}
                    >
                        Back
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ForgotPassword;