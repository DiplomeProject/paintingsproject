import React, { useState } from "react";
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // заглушка
    console.log("Submit", formData);
    alert("Форма отправлена (проверь консоль)");
  };

  return (
    <div className="register-container">
      <form className="register-card" onSubmit={handleSubmit}>
        <div className="reg-via">Registration via:</div>

        <div className="social-row">
          <button type="button" className="social twitter" aria-label="Twitter">
            <TwitterIcon />
          </button>
          <button type="button" className="social facebook" aria-label="Facebook">
            <FacebookIcon />
          </button>
          <button type="button" className="social mail" aria-label="Mail">
            <MailIcon />
          </button>
        </div>

        <div className="reg-email">Registration via email</div>

        <div className="field">
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            required
          />
        </div>

        <div className="field">
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
        </div>

        <div className="field">
          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            required
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
          />
          <button
            type="button"
            aria-label="toggle password"
            className="eye-btn"
            onClick={() => setShowPassword((s) => !s)}
          >
            {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
          </button>
        </div>

          <button type="submit" className="btn-next">Next</button>
          <button type="button" className="btn-login" onClick={toggleForm}>
            Login
          </button>
      </form>
    </div>
  );
}

export default Register;
