import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import "./Register.css";

const TwitterIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 5.8c-.6.3-1.2.5-1.9.6.7-.4 1.2-1 1.4-1.8-.6.4-1.4.7-2.1.9C18.8 4.7 17.9 4 17 4c-1.7 0-3 1.4-3 3 0 .2 0 .4.1.6-2.5-.1-4.7-1.3-6.2-3C7 4.1 6.5 5.1 6.5 6.3c0 1 .5 1.8 1.3 2.3-.5 0-1-.2-1.4-.4v.1c0 1.6 1.1 2.9 2.6 3.2-.4.1-.8.2-1.3.2-.3 0-.6 0-.9-.1.6 1.8 2.4 3.1 4.5 3.1-1.7 1.3-3.8 2-6.1 2-.4 0-.8 0-1.2-.1 2.2 1.4 4.8 2.2 7.6 2.2 9.1 0 14.1-7.5 14.1-14 0-.2 0-.5 0-.7.9-.7 1.6-1.6 2.1-2.6-.8.4-1.7.7-2.6.8z" />
  </svg>
);

const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12.1C22 6.6 17.5 2 12 2S2 6.6 2 12.1c0 4.9 3.6 8.9 8.3 9.9v-7H7.9v-2.9h2.4V9.4c0-2.4 1.4-3.7 3.5-3.7 1 0 2.1.2 2.1.2v2.3h-1.1c-1.1 0-1.4.7-1.4 1.4v1.7h2.5l-.4 2.9h-2.1V22c4.7-1 8.3-5 8.3-9.9z"/>
  </svg>
);

const MailIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

const EyeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 11.5A4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 0 1 0 9z"/>
  </svg>
);

const EyeSlashIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 4.27L3.28 3 21 20.72 19.73 22 16.5 18.77C14.9 19.5 13 20 12 20c-7 0-11-7-11-7 .9-1.7 2.3-3.4 4-4.7L2 4.27zM12 6c1 0 2 .3 2.9.8L8.8 13h-.1A4.5 4.5 0 0 0 12 6z"/>
  </svg>
);

function Register({ toggleForm }) {
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
      console.log("=== SKIPPING EMAIL FOR TESTING ===");
      console.log("Name:", name);
      console.log("Email:", email);  
      console.log("Code:", code);
      console.log("=================================");
      
      // TODO: Uncomment this when EmailJS is working
      /*
      console.log("Attempting to send email with EmailJS...");
      const result = await emailjs.send(
        "service_fv0f2qo",
        "template_zn93brw",
        {
          name: name,
          verification_code: code,
          to_email: email,
          reply_to: email,
        },
        "7Gw-RPTO7wMAtHcSb"
      );
      console.log("EmailJS response:", result);
      console.log("Verification code sent successfully");
      */
      
      return true; // Temporary: always return true
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
      
      // Генерируем код
      const code = generateCode();
      console.log("Generated code:", code);
      
      // Отправляем email с кодом
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
      headers: { "Content-Type": "application/json" },
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="register-container">
      <form
        className="register-card"
        onSubmit={step === 1 ? handleSubmit : handleVerifyCode}
      >
        {step === 1 ? (
          <>
            <div className="reg-via">Registration via:</div>
            <div className="social-row">
              <button type="button" className="social twitter"><TwitterIcon /></button>
              <button type="button" className="social facebook"><FacebookIcon /></button>
              <button type="button" className="social mail"><MailIcon /></button>
            </div>

            <div className="reg-email">Registration via email</div>

            <div className="field">
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                required
                disabled={loading}
              />
            </div>

            <div className="field">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                disabled={loading}
              />
            </div>

            <div className="field">
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="field pw-field">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                disabled={loading}
                minLength="6"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword((s) => !s)}
                disabled={loading}
              >
                {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
              </button>
            </div>

            <button type="submit" className="btn-next" disabled={loading}>
              {loading ? "Відправка..." : "Next"}
            </button>
            <button type="button" className="btn-login" onClick={toggleForm} disabled={loading}>
              Login
            </button>
          </>
        ) : (
          <>
            <h2 style={{ color: "black" }}>Підтвердження email</h2>
            <p style={{ color: "black" }}>
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
            <button type="submit" className="btn-next" style={{ justifySelf: "center", marginRight: "10px" }} disabled={loading}>
              {loading ? "Перевірка..." : "Підтвердити"}
            </button>
            <button 
              type="button" 
              className="btn-login" 
              onClick={() => setStep(1)}
              disabled={loading}
              style={{ marginTop: "10px" }}
            >
              Назад
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default Register;