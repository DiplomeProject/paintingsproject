import React, { useState } from "react";
import emailjs from "@emailjs/browser";

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
        "service_fv0f2qo", // your service ID
        "template_zn93brw", // your template ID
        {
          name: name,
          verification_code: code,
          to_email: email,
          reply_to: email,
        },
        "7Gw-RPTO7wMAtHcSb" // your public key
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
    <form onSubmit={step === 1 ? handleSubmit : handleVerifyCode}>
      {step === 1 ? (
        <>
          <h2>РЕЄСТРАЦІЯ</h2>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Ім'я:</label>
            <input
              type="text"
              className="form-control"
              name="name"
              onChange={handleInputChange}
              placeholder="Ім'я"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="surname" className="form-label">Прізвище:</label>
            <input
              type="text"
              name="surname"
              className="form-control"
              onChange={handleInputChange}
              placeholder="Прізвище"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Пошта:</label>
            <input
              type="email"
              name="email"
              className="form-control"
              onChange={handleInputChange}
              placeholder="Пошта"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Пароль:</label>
            <input
              type="password"
              name="password"
              className="form-control"
              onChange={handleInputChange}
              placeholder="Пароль"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="passwordConfirmed" className="form-label">Підтвердження паролю:</label>
            <input
              type="password"
              name="passwordConfirmed"
              className="form-control"
              onChange={handleInputChange}
              placeholder="Підтвердження паролю"
              required
            />
          </div>
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
        </>
      ) : (
        <>
          <h2>Підтвердження електронної пошти</h2>
          <p>Ми надіслали 6-значний код на вашу електронну адресу.</p>
          <div className="mb-3">
            <label htmlFor="verificationCode" className="form-label">
              Код підтвердження:
            </label>
            <input
              type="text"
              name="verificationCode"
              className="form-control"
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
