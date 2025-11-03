import React, {useState} from "react";
import styles from "./Register.module.css";
import emailjs from "@emailjs/browser";
import {EyeIcon, EyeSlashIcon} from "./AuthIcons"; // Видалено непотрібні іконки
import "./Register.module.css";

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
            /* const result = await emailjs.send(
               "service_fv0f2qo",
               "template_zn93brw",
               {
                 name: name,
                 verification_code: code,
                 to_email: email,
                 reply_to: email,
               },
               "7Gw-RPTO7wMAtHcSb"
             );*/
            //console.log("EmailJS response:", result);
            console.log("Verification code sent successfully");


            return true;
        } catch (error) {
            console.error("Email sending failed:", error);
            console.error("Error details:", error.text || error.message);
            return false;
        }
    };

    // Обработка шага 1 (отправка кода)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log("Starting registration process...");

            const code = generateCode();
            console.log("Generated code:", code);

            console.log("Sending verification email to:", formData.email);

            const emailSent = await sendVerificationEmail(formData.username, formData.email, code);

            console.log("Email sent result:", emailSent);

            if (emailSent) {
                setGeneratedCode(code);
                setStep(2);
                console.log("Moving to step 2");
            }
        } catch (error) {
            console.error("Error during submission:", error);
            alert("Сталася помилка: " + error.message);
        } finally {
            console.log("Setting loading to false");
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log("User entered code:", userCode);
            console.log("Generated code:", generatedCode);
            console.log("Form data to submit:", formData);

            if (userCode.trim() !== generatedCode.trim()) {
                alert("Невірний код підтвердження");
            }

            const response = await fetch("http://localhost:8080/register", {
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
                    <div className={styles.title}>Registration via email</div>

                    <div className={styles.field}>
                        <label htmlFor="reg-username">Username</label>
                        <input id="reg-username" name="username"
                               value={formData.username}
                               onChange={handleChange}
                               placeholder="Username"
                               required
                               disabled={loading}
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="reg-email">Email</label>
                        <input id="reg-email" type="email" name="email"
                               value={formData.email}
                               onChange={handleChange}
                               placeholder="Email"
                               required
                               disabled={loading}
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="reg-birthday">Birthday</label>
                        <input id="reg- birthday" type="date" name="birthday"
                               value={formData.birthday}
                               onChange={handleChange}
                               required
                               disabled={loading}
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="reg-password">Password</label>
                        <div className={styles.passwordWrapper}>
                            <input id="reg-password" name="password"
                                   type={showPassword ? "text" : "password"}
                                   value={formData.password}
                                   onChange={handleChange}
                                   placeholder="Password"
                                   required
                                   disabled={loading}
                                   minLength="6"
                            />
                            <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword((s) => !s)}>
                                {showPassword ? <EyeSlashIcon/> : <EyeIcon/>}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? "Send data..." : "Next"}
                    </button>

                    <button type="button" className={styles.switchFormBtn} onClick={toggleForm}>
                        Already have an account? Log in
                    </button>
                </>
            ) : (<>
                    <h2 style={{color: "black"}}>Підтвердження email</h2>
                    <p style={{color: "black"}}>
                        Ми надіслали 6-значний код на <strong>{formData.email}</strong>
                    </p>
                    <div className="field">
                        <input
                            type="text"
                            placeholder="Введіть код (6 цифр)"
                            value={userCode}
                            onChange={(e) => setUserCode(e.target.value)}
                            required
                            maxLength="6"
                            pattern="\d{6}"
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" className="btn-next" style={{justifySelf: "center", marginRight: "10px"}}
                            disabled={loading}>
                        {loading ? "Перевірка..." : "Підтвердити"}
                    </button>
                    <button
                        type="button"
                        className="btn-login"
                        onClick={() => setStep(1)}
                        disabled={loading}
                        style={{marginTop: "10px"}}
                    >
                        Назад
                    </button>
                </>
            )}
        </form>
    );
}

export default Register;
