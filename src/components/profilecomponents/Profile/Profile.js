import React, { useState, useEffect } from 'react';
import axios from "axios";
import GalleryArtist from "../../GalleryArtist/GalleryArtist";
import Login from "../Login/Login";
import Register from "../Register/Register";
import styles from './Profile.module.css'; // ОНОВЛЕНО: Імпортуємо модуль

function Profile() {
    const [user, setUser] = useState(null); // Змінено початковий стан
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
        fetch('http://localhost:8080/check-session', { credentials: 'include' })
            .then(response => response.json())
            .then(data => {
                if (data.loggedIn) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            })
            .catch(error => console.error('Error:', error));
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
    };

    const handleLogin = async (e) => {
        e.preventDefault();
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
        } catch (error) {
            console.error('Login failed:', error);
            alert('Ошибка при авторизации');
        }
    };

    const handleRegister = async (e, formData) => {
    e.preventDefault();
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
    } catch (error) {
        console.error("Registration failed:", error);
        alert("Помилка при реєстрації");
    }
    };


    const toggleForm = () => setIsLogin(!isLogin);

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8080/logout', {}, { withCredentials: true });
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className={styles.profilePage}>
            {user ? (
                // --- Секція для залогіненого користувача ---
                <div className={styles.profileContainer}>
                    <div className={styles.profileCard}>
                        <div className={styles.sidebar}>
                            <img
                                src={user.profileImage || '/images/icons/profile.jpg'}
                                alt="Avatar"
                                className={styles.avatar}
                            />
                            <h2 className={styles.userName}>{user.name} {user.surname}</h2>
                            <div className={styles.buttonGroup}>
                                <button onClick={() => setShowModal(true)} className={styles.editButton}>Редагувати</button>
                                <button onClick={handleLogout} className={styles.logoutButton}>Вийти</button>
                            </div>
                            <div className={styles.userInfo}>
                                <h3>Про себе:</h3>
                                <p>{user.bio || 'Інформація відсутня.'}</p>
                                <h3>Контакти:</h3>
                                <p>{user.email}</p>
                            </div>
                        </div>
                        <div className={styles.mainContent}>
                            <h3>Роботи художника</h3>
                            <hr />
                            <GalleryArtist user={user} />
                        </div>
                    </div>
                </div>
            ) : (
                // --- Секція для гостя (форми входу/реєстрації) ---
                <div className={styles.authFormsContainer}>
                    {isLogin ? (
                        <Login
                            handleLogin={handleLogin}
                            handleInputChange={handleInputChange}
                            toggleForm={toggleForm}
                        />
                    ) : (
                        <Register handleRegister={handleRegister} toggleForm={toggleForm} />
                    )}
                </div>
            )}

            {/* --- Модальне вікно редагування --- */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h5>Редагувати профіль</h5>
                            <button type="button" className={styles.closeButton} onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <div className={styles.modalBody}>
                            <form onSubmit={handleProfileUpdate}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="name">Ім'я</label>
                                    <input type="text" id="name" name="name" defaultValue={user.name || ''} onChange={handleInputChange}/>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="surname">Прізвище</label>
                                    <input type="text" id="surname" name="surname" defaultValue={user.surname || ''} onChange={handleInputChange}/>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="bio">Про себе</label>
                                    <textarea id="bio" name="bio" defaultValue={user.bio || ''} onChange={handleInputChange}></textarea>
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