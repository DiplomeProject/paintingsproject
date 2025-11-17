import React, { useState, useEffect } from 'react';
import axios from "axios";
import Login from "../Login/Login";
import Register from "../Register/Register";
import ForgotPassword from "../Login/ForgotPassword/ForgotPassword";
import styles from './Profile.module.css';
import DigitalBrushProfile from "./UserProfile/DigitalBrushProfile";

// Мок-користувач для тестування
const MOCK_USER = {
    name: "Maksym",
    surname: "Protsenko",
    email: "test-user@gmail.com",
    bio: "I create visual solutions that not only look good, but also work...",
    profileImage: "https://i.pravatar.cc/300"
};

// Флаг для переключения между мок-данными и реальным бэкендом
const USE_MOCK_DATA = true; // установите false для использования реального бэкенда

function Profile() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('login');
    const [isLogin, setIsLogin] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        bio: '',
        email: '',
        password: ''
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (USE_MOCK_DATA) {
            // Используем мок-данные
            setUser(MOCK_USER);
            setFormData({
                name: MOCK_USER.name || '',
                surname: MOCK_USER.surname || '',
                bio: MOCK_USER.bio || '',
                email: MOCK_USER.email || '',
                password: ''
            });
            if (MOCK_USER.profileImage) {
                setImagePreview(MOCK_USER.profileImage);
            }
        } else {
            // Реальный бэкенд
            fetch('http://localhost:8080/check-session', { credentials: 'include' })
                .then(response => response.json())
                .then(data => {
                    if (data.loggedIn) {
                        setUser(data.user);
                        setFormData({
                            name: data.user.name || '',
                            surname: data.user.surname || '',
                            bio: data.user.bio || '',
                            email: data.user.email || '',
                            password: ''
                        });
                        if (data.user.profileImage) {
                            setImagePreview(data.user.profileImage);
                        }
                    } else {
                        setUser(null);
                    }
                })
                .catch(error => console.error('Error checking session:', error));
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();

        if (USE_MOCK_DATA) {
            // Мок-обновление профиля
            console.log("Mock Profile Update:", formData);
            alert("Профіль оновлено (симуляція)");
            setShowModal(false);
            setUser(prev => ({...prev, ...formData}));
        } else {
            // Реальное обновление профиля
            try {
                const formDataToSend = new FormData();
                formDataToSend.append('name', formData.name || user.name);
                formDataToSend.append('surname', formData.surname || user.surname);
                formDataToSend.append('bio', formData.bio || user.bio);
                formDataToSend.append('email', formData.email || user.email);

                if (selectedFile) {
                    formDataToSend.append('profileImage', selectedFile);
                }

                const response = await axios.post('http://localhost:8080/update-profile', formDataToSend, {
                    withCredentials: true,
                });
                setUser(response.data.user);
                setShowModal(false);
            } catch (error) {
                console.error('Error updating profile:', error);
                alert('Ошибка при обновлении профиля');
            }
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (USE_MOCK_DATA) {
            // Мок-логин
            console.log("Mock Login");
            setUser(MOCK_USER);
            setFormData({
                name: MOCK_USER.name || '',
                surname: MOCK_USER.surname || '',
                bio: MOCK_USER.bio || '',
                email: MOCK_USER.email || '',
                password: ''
            });
            setImagePreview(MOCK_USER.profileImage);
            setView('profile');
        } else {
            // Реальный логин
            try {
                const response = await axios.post('http://localhost:8080/login', {
                    email: formData.email,
                    password: formData.password,
                }, { withCredentials: true });
                setUser(response.data.user);
                localStorage.setItem("user", JSON.stringify(response.data.user));
                setFormData({
                    name: response.data.user.name || '',
                    surname: response.data.user.surname || '',
                    bio: response.data.user.bio || '',
                    email: response.data.user.email
                });
                if (response.data.user.profileImage) {
                    setImagePreview(response.data.user.profileImage);
                }
                setView('profile');
            } catch (error) {
                console.error('Login failed:', error);
                alert('Ошибка при авторизации');
            }
        }
    };

    const handleRegister = async (e, formData) => {
        e.preventDefault();

        if (USE_MOCK_DATA) {
            // Мок-регистрация
            console.log("Mock Register");
            alert("Реєстрація успішна (симуляція), увійдіть у свій акаунт");
            setIsLogin(true);
            setView('login');
        } else {
            // Реальная регистрация
            try {
                const response = await axios.post(
                    "http://localhost:8080/register",
                    {
                        name: formData.name,
                        surname: formData.surname,
                        email: formData.email,
                        password: formData.password,
                    },
                    { withCredentials: true }
                );

                alert("Реєстрація успішна, увійдіть у свій акаунт");
                setIsLogin(true);
                setView('login');
            } catch (error) {
                console.error("Registration failed:", error);
                alert("Помилка при реєстрації");
            }
        }
    };

    const handleLogout = async () => {
        if (USE_MOCK_DATA) {
            // Мок-выход
            console.log("Mock Logout");
            setUser(null);
            setView('login');
        } else {
            // Реальный выход
            try {
                await axios.post('http://localhost:8080/logout', {}, { withCredentials: true });
                setUser(null);
                setView('login');
            } catch (error) {
                console.error('Logout failed:', error);
            }
        }
    };

    const showLogin = () => setView('login');
    const showRegister = () => setView('register');
    const showForgotPassword = () => setView('forgotPassword');

    return (
        <div className={styles.profilePage}>
            {user ? (
                // --- Секція для залогіненого користувача ---
                <DigitalBrushProfile
                    user={user}
                    onEditProfile={() => setShowModal(true)}
                    onLogout={handleLogout}
                />
            ) : (
                // --- Секція для гостя (форми входу/реєстрації) ---
                <div className={styles.authFormsContainer}>
                    {view === 'login' && (
                        <Login
                            handleLogin={handleLogin}
                            handleInputChange={handleInputChange}
                            toggleForm={showRegister}
                            onForgotPassword={showForgotPassword}
                        />
                    )}
                    {view === 'register' && (
                        <Register
                            handleRegister={handleRegister}
                            toggleForm={showLogin}
                        />
                    )}
                    {view === 'forgotPassword' && (
                        <ForgotPassword
                            onBack={showLogin}
                        />
                    )}
                </div>
            )}

            {/* --- Модальне вікно редагування --- */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h5>Редагувати профіль</h5>
                            <button type="button" className={styles.closeButton} onClick={() => { setShowModal(false); setImagePreview(user.profileImage || null); }} >&times;</button>
                        </div>
                        <div className={styles.modalBody}>
                            <form onSubmit={handleProfileUpdate}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="name">Ім'я</label>
                                    <input type="text" id="name" name="name" defaultValue={formData.name} onChange={handleInputChange}/>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="surname">Прізвище</label>
                                    <input type="text" id="surname" name="surname" defaultValue={formData.surname} onChange={handleInputChange}/>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="bio">Про себе</label>
                                    <textarea id="bio" name="bio" defaultValue={formData.bio} onChange={handleInputChange}></textarea>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="profileImage">Змінити зображення</label>
                                    <input type="file" id="profileImage" onChange={handleImageChange}/>
                                    {imagePreview && <img src={imagePreview} alt="Preview" className={styles.imagePreview}/>}
                                </div>
                                <button type="submit" className={styles.saveButton}>Зберегти зміни</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;