import React, { useState, useEffect } from 'react';
import axios from "axios";
import GalleryArtist from "./GalleryArtist";

function Profile() {
    const [user, setUser] = useState();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        bio: ''
    });
    const [imagePreview, setImagePreview] = useState('img/icons/profile.jpg');
    const [showModal, setShowModal] = useState(false);

    // Получаем данные пользователя при загрузке компонента
    useEffect(() => {
        fetch('http://localhost:8080/check-session', {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                if (data.loggedIn) {
                    setUser(data.user);
                    console.log(data.user);
                } else {
                    setUser(null);
                    console.log(user);
                }
            })
            .catch(error => console.error('Error:', error));
    }, []);

    // Обработчик изменения данных в форме
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const [selectedFile, setSelectedFile] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file); // Сохраняем файл в состояние
            setImagePreview(URL.createObjectURL(file)); // Показываем предпросмотр
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

            if (selectedFile) { // Проверяем наличие файла
                formDataToSend.append('profileImage', selectedFile); // Добавляем файл в FormData
            }

            const response = await axios.post('http://localhost:8080/update-profile', formDataToSend, {
                withCredentials: true,
            });
            setUser(response.data.user);
            setShowModal(false); // Закрываем модальное окно после обновления
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Ошибка при обновлении профиля');
        }
    };

    // Handle login
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/login', {
                email: formData.email,
                password: formData.password,
            }, { withCredentials: true });
            setUser(response.data.user);
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

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/register', {
                name: formData.name,
                surname: formData.surname,
                email: formData.email,
                password: formData.password,
            }, { withCredentials: true });
            setUser(response.data.user);
            alert("Реєстрація успішна");
        } catch (error) {
            console.error('Registration failed:', error);
            alert('Ошибка при регистрации');
        }
    };

    // Toggle between login and registration forms
    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8080/logout', {}, { withCredentials: true });
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div id="mainContent">
            <section>
                {user ? (
                    <div className="container2 py-5">
                        <div className="row d-flex justify-content-center align-items-center">
                            <div className="col col-lg-6 mb-4 mb-lg-0">
                                <div className="card mb-3" style={{ borderRadius: '.5rem' }}>
                                    <div className="row g-0">
                                        <div className="profile col-md-4 gradient-custom text-center text-white"
                                             style={{
                                                 borderTopLeftRadius: '.5rem',
                                                 borderBottomLeftRadius: '.5rem',
                                                 background: 'linear-gradient(to right bottom, rgba(246, 211, 101, 1), rgba(253, 160, 133, 1))'
                                             }}>
                                            <img id="profile-image" src={user.profileImage || imagePreview} alt="Avatar"
                                                 className="img-fluid rounded-circle" style={{ width: '250px', height: '250px' }} />
                                            <h2>{user.name} {user.surname}</h2>
                                            <button onClick={() => setShowModal(true)} className="btn btn-info">Редагувати профіль</button>
                                            <button onClick={handleLogout} className="btn btn-danger">
                                                Вийти
                                            </button>
                                            <div className="about">
                                                <h3>Про себе:</h3>
                                                <p>{user.bio || ''}</p>
                                                <div className="contact">
                                                    <h3>Контактна інформація:</h3>
                                                    <p>{user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-8">
                                            <div className="card-body p-4">
                                                <h6>Paintings</h6>
                                                <hr className="mt-0 mb-4" />
                                                <GalleryArtist user={user} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="container">
                        {isLogin ? (
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
                        ) : (
                            <form onSubmit={handleRegister}>
                                <h2>РЕЄСТРАЦІЯ</h2>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">Ім'я:</label>
                                    <input type="text" className="form-control" name="name" onChange={handleInputChange}
                                           placeholder="Ім'я"/>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="surname" className="form-label">Прізвище:</label>
                                    <input type="text" name="surname" className="form-control"
                                           onChange={handleInputChange} placeholder="Прізвище"/>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Пошта:</label>
                                    <input type="email" name="email" className="form-control"
                                           onChange={handleInputChange} placeholder="Пошта"/>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Пароль:</label>
                                    <input type="password" name="password" className="form-control"
                                           onChange={handleInputChange} placeholder="Пароль"/>
                                </div>
                                <button type="submit" className="btn btn-primary">Зареєструватися</button>
                                <button type="button" onClick={toggleForm} className="btn btn-secondary">Вже є аккаунт?
                                    Увійти
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* Модальное окно редактирования профиля */}
                <div className={`modal fade ${showModal ? 'show' : ''}`} style={{display: showModal ? 'block' : 'none', backgroundColor: 'rgba(0, 0, 0, 0.7)'}}
                     tabIndex="-1" aria-labelledby="profileModal" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="profileModal">Редагировать профиль</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"
                                        onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleProfileUpdate}>
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">Имя</label>
                                        <input type="text" id="name" name="name" className="form-control"
                                               value={formData.name || (user ? user.name : '')} onChange={handleInputChange}/>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="surname" className="form-label">Фамилия</label>
                                        <input type="text" id="surname" name="surname" className="form-control"
                                               value={formData.surname || (user ? user.surname : '')} onChange={handleInputChange}/>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="bio" className="form-label">О себе</label>
                                        <textarea id="bio" name="bio" className="form-control" value={formData.bio || (user ? user.bio : '')}
                                                  onChange={handleInputChange}></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="profileImage" className="form-label">Изменить
                                            изображение</label>
                                        <input type="file" className="form-control" onChange={handleImageChange}/>
                                        {imagePreview &&
                                            <img src={imagePreview || (user ? user.image : '')} alt="Image preview" className="img-fluid mt-3"
                                                 style={{width: '100px'}}/>}
                                    </div>
                                    <button type="submit" className="btn btn-primary">Сохранить изменения</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Profile;
