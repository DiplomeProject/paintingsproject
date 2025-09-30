import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import "./Register.css"; // Подключаем обычный CSS

function Register({ toggleForm }) {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    passwordConfirmed: "",
  });

  const [generatedCode, setGeneratedCode] = useState("");
  const [userCode, setUserCode] = useState("");
  const [step, setStep] = useState(1);

  const generateCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const sendVerificationEmail = async (name, email, code) => {
    try {
      await emailjs.send(
        "service_fv0f2qo",
        "template_zn93brw",
        { name, verification_code: code, to_email: email, reply_to: email },
        "7Gw-RPTO7wMAtHcSb"
      );
      console.log("Verification code sent to email.");
    } catch (error) {
      console.error("Email sending failed:", error);
      alert("Не вдалося надіслати код підтвердження");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirmed) {
      alert("Паролі не співпадають");
      return;
    }
    const code = generateCode();
    setGeneratedCode(code);
    await sendVerificationEmail(formData.name, formData.email, code);
    setStep(2);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (userCode !== generatedCode) {
      alert("Невірний код підтвердження");
      return;
    }
    try {
      const response = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Помилка реєстрації");
      } else {
        alert("Реєстрація успішна");
        localStorage.setItem("user", JSON.stringify(data));
        toggleForm();
      }
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Сталася помилка сервера");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form
      onSubmit={step === 1 ? handleSubmit : handleVerifyCode}
      className="register-form"
    >
      {step === 1 ? (
        <>
          <h2>РЕЄСТРАЦІЯ</h2>
          {["name", "surname", "email", "password", "passwordConfirmed"].map(
            (field) => (
              <div className="form-group" key={field}>
                <label className="form-label">
                  {field === "name"
                    ? "Ім'я:"
                    : field === "surname"
                    ? "Прізвище:"
                    : field === "email"
                    ? "Пошта:"
                    : field === "password"
                    ? "Пароль:"
                    : "Підтвердження паролю:"}
                </label>
                <input
                  type={field.toLowerCase().includes("password") ? "password" : "text"}
                  name={field}
                  className="form-input"
                  onChange={handleInputChange}
                  required
                />
              </div>
            )
          )}
          <div className="button-group">
            <button type="submit" className="btn btn-primary">
              Зареєструватися
            </button>
            <button
              type="button"
              onClick={toggleForm}
              className="btn btn-secondary"
            >
              Вже є аккаунт? Увійти
            </button>
          </div>
        </>
      ) : (
        <>
          <h2>Підтвердження електронної пошти</h2>
          <p>Ми надіслали 6-значний код на вашу електронну адресу.</p>
          <div className="form-group">
            <label className="form-label">Код підтвердження:</label>
            <input
              type="text"
              className="form-input"
              placeholder="Введіть код"
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Підтвердити
          </button>
        </>
      )}
    </form>
  );
}

export default Register;
