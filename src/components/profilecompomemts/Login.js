import React from "react";

function Login({ handleLogin, handleInputChange, toggleForm }) {
    return (
        <form onSubmit={handleLogin}>
            <h2>АВТОРІЗАЦІЯ</h2>
            <div className="mb-3">
                <label htmlFor="email" className="form-label">Пошта:</label>
                <input type="email" className="form-control" id="email" name="email"
                       onChange={handleInputChange} placeholder="Пошта"/>
            </div>
            <div className="mb-3">
                <label htmlFor="password" className="form-label">Пароль:</label>
                <input type="password" className="form-control" id="password" name="password"
                       onChange={handleInputChange} placeholder="Пароль"/>
            </div>
            <button type="submit" className="btn btn-primary">Увійти</button>
            <button type="button" onClick={toggleForm}
                    className="btn btn-secondary">Зареєструватися
            </button>
        </form>
    );
}

export default Login;
