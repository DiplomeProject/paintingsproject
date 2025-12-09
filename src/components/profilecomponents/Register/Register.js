import React, {useState} from "react";
import styles from "./Register.module.css";
import {EyeIcon, EyeSlashIcon} from "./AuthIcons";
import url  from '../../../URL';

function Register({toggleForm}) {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        birthday: "",
        password: "",
    });

    const [step, setStep] = useState(1);
    const [generatedCode, setGeneratedCode] = useState("");
    const [userCode, setUserCode] = useState("");
    const [loading, setLoading] = useState(false);

    const generateCode = () =>
        Math.floor(100000 + Math.random() * 900000).toString();

    const sendVerificationEmail = async (name, email, code) => {
        try {
            console.log(code);
            console.log("Attempting to send email with EmailJS...");
            // EmailJS код здесь
            console.log("Verification code sent successfully");
            return true;
        } catch (error) {
            console.error("Email sending failed:", error);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const code = generateCode();
            const emailSent = await sendVerificationEmail(formData.username, formData.email, code);

            if (emailSent) {
                setGeneratedCode(code);
                setStep(2);
            }
        } catch (error) {
            console.error("Error during submission:", error);
            alert("Сталася помилка: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (userCode.trim() !== generatedCode.trim()) {
                alert("Невірний код підтвердження");
                return;
            }

            const response = await fetch(`${url}/api/auth/register`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Registration error:", data);
                alert(data.error || data.message || "Помилка реєстрації");
            } else {
                alert("Реєстрація успішна! Тепер ви можете увійти.");
                toggleForm();
            }
        } catch (error) {
            console.error("Registration failed:", error);
            alert("Сталася помилка сервера. Перевірте з'єднання.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    };

    return (
        <form className={styles.authCard} onSubmit={step === 1 ? handleSubmit : handleVerifyCode}>
            {step === 1 ? (
                <>
                    <h2 className={styles.mainTitle}>Registration via email</h2>

                    <div className={styles.field}>
                        <label htmlFor="reg-username">Username</label>
                        <input id="reg-username" name="username"
                               value={formData.username}
                               onChange={handleChange}
                               required
                               disabled={loading}
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="reg-email">Email</label>
                        <input id="reg-email" type="email" name="email"
                               value={formData.email}
                               onChange={handleChange}
                               required
                               disabled={loading}
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="reg-birthday">Birthday</label>
                        <input id="reg-birthday" type="date" name="birthday"
                               value={formData.birthday}
                               onChange={handleChange}
                               required
                               disabled={loading}
                               onClick={(e) => e.target.showPicker()}
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="reg-password">Password</label>
                        <div className={styles.passwordWrapper}>
                            <input id="reg-password" name="password"
                                   type={showPassword ? "text" : "password"}
                                   value={formData.password}
                                   onChange={handleChange}
                                   required
                                   disabled={loading}
                                   minLength="6"
                            />
                            <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword((s) => !s)}>
                                {showPassword ?  <EyeIcon/>: <EyeSlashIcon/>}
                            </button>
                        </div>
                    </div>

                    <div className={styles.buttonsRow}>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? "Send data..." : "Next"}
                        </button>
                        <button type="button" className={styles.backBtn} onClick={toggleForm} disabled={loading}>
                            Back
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <h2 className={styles.mainTitle}>Email confirmation</h2>

                    <p className={styles.emailTitle} style={{textAlign: 'left', marginBottom: '20px'}}>
                        We have sent a 6-digit code to <strong>{formData.email}</strong>
                    </p>

                    <div className={styles.field}>
                        <input
                            type="text"
                            placeholder="Enter the code (6 digits)"
                            value={userCode}
                            onChange={(e) => setUserCode(e.target.value)}
                            required
                            maxLength="6"
                            pattern="\d{6}"
                            disabled={loading}
                            className={styles.codeInput}
                        />
                    </div>

                    <div className={styles.buttonsRow}>

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? "verification..." : "Confirm"}
                        </button>

                        <button
                            type="button"
                            className={styles.backBtn}
                            onClick={() => setStep(1)}
                            disabled={loading}
                        >
                            Back
                        </button>
                    </div>
                </>
            )}
        </form>
    );
}

export default Register;