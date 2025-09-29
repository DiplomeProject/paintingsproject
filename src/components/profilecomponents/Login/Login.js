import React from "react";
import "./Login.css"; // Подключаем обычный CSS

function Login({ handleLogin, handleInputChange, toggleForm }) {
    return (
        <form onSubmit={handleLogin} className="login-form">
            <h2>DIGITAL BRUSH</h2>
            <div className="form-group">
                <label htmlFor="email" className="form-label">Пошта:</label>
                <input
                    type="email"
                    className="form-input"
                    id="email"
                    name="email"
                    onChange={handleInputChange}
                />
            </div>
            <div className="form-group">
                <label htmlFor="password" className="form-label">Пароль:</label>
                <input
                    type="password"
                    className="form-input"
                    id="password"
                    name="password"
                    onChange={handleInputChange}
                />
            </div>
            <div className="button-group">
                <button type="submit" className="btn btn-primary">Увійти</button>
                <button type="button" onClick={toggleForm} className="btn btn-secondary">
                    Зареєструватися
                </button>
            </div>
        </form>
    );
}

export default Login;
