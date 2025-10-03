import React, { useState, useEffect } from 'react';
import axios from "axios";
import GalleryArtist from "../../GalleryArtist/GalleryArtist";
import Login from "../Login/Login";
import Register from "../Register/Register";
import emailjs from '@emailjs/browser';

function Profile() {
    const [user, setUser] = useState();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        email: '',
        password: ''
    });
    const [imagePreview, setImagePreview] = useState('img/icons/profile.jpg');
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
        <div className="Profile">
            <section>
                {user ? (
                    <div className="container2 py-5">
                        <div className="row d-flex justify-content-center align-items-center">
                            <div className="col col-lg-6 mb-4 mb-lg-0">
                                <div className="card mb-3" style={{ borderRadius: '.5rem', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: 'none' }}>
                                    <div className="row g-0">
                                        <div className="profile col-md-4 gradient-custom text-center text-white"
                                             style={{
                                                 borderTopLeftRadius: '.5rem',
                                                 borderBottomLeftRadius: '.5rem',
                                                 background: 'linear-gradient(to right bottom, rgba(246, 211, 101, 1), rgba(253, 160, 133, 1))'
                                             }}>
                                            <img id="profile-image" src={user.profileImage || imagePreview} alt="Avatar"
                                                 className="img-fluid rounded-circle"
                                                 style={{ width: '250px', height: '250px' }} />
                                            <h2>{user.name}</h2>
                                            <button onClick={() => setShowModal(true)} className="btn btn-info">Редагувати профіль</button>
                                            <button onClick={handleLogout} className="btn btn-danger">Вийти</button>
                                            <div className="about">
                                                <h3>Про себе:</h3>
                                                <p>{user.bio || ''}</p>
                                                <div className="contact">
                                                    <h3>Контактна інформація:</h3>
                                                    <p>{user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-8" style={{ background: 'transparent' }}>
                                            <div className="card-body p-4" style={{ background: 'transparent' }}>
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

                {/* Модальное окно редактирования профиля */}
                {showModal && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Редагувати профіль</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={handleProfileUpdate}>
                                        <div className="mb-3">
                                            <label htmlFor="name" className="form-label">Ім'я</label>
                                            <input type="text" id="name" name="name" className="form-control"
                                                   value={formData.name || (user ? user.name : '')}
                                                   onChange={handleInputChange}/>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="bio" className="form-label">Про себе</label>
                                            <textarea id="bio" name="bio" className="form-control"
                                                      value={formData.bio || (user ? user.bio : '')}
                                                      onChange={handleInputChange}></textarea>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="profileImage" className="form-label">Змінити зображення</label>
                                            <input type="file" className="form-control" onChange={handleImageChange}/>
                                            {imagePreview &&
                                                <img src={imagePreview} alt="Image preview" className="img-fluid mt-3" style={{ width: '100px' }}/>}
                                        </div>
                                        <button type="submit" className="btn btn-primary">Зберегти зміни</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Profile;