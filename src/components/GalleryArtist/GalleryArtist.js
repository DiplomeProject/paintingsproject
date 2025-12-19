import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./GalleryArtist.css"; // Подключаем кастомный css
import url from '../../URL';

function GalleryArtist({ user }) {
    const [paintings, setPaintings] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedPainting, setSelectedPainting] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null,
    });
    const [imagePreview, setImagePreview] = useState('img/icons/add_image.jpg');

    useEffect(() => {
        const loadPaintings = async () => {
            try {
                const response = await axios.get(`/profile/getuserpaintings`);
                setPaintings(response.data);
            } catch (error) {
                console.error('Error loading the paintings:', error);
            }
        };

        loadPaintings();
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prevData) => ({ ...prevData, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleEditPainting = (painting) => {
        setSelectedPainting(painting);
        setFormData({
            title: painting.title,
            description: painting.description,
            image: null,
        });
        setImagePreview(painting.Image);
        setShowModal(true);
    };

    const handleAddPainting = () => {
        setFormData({ title: '', description: '', image: null });
        setImagePreview('img/icons/add_image.jpg');
        setShowAddModal(true);
    };

    const handleUpdatePainting = async (e) => {
        e.preventDefault();
        alert('Оновлення картини наразі не підтримується API. Будь ласка, видаліть і додайте заново.');
        return;
    };

const handleAddNewPainting = async (e) => {
  e.preventDefault();
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    if (formData.image) formDataToSend.append('image', formData.image);

    console.log('Sending upload request with:', formDataToSend);
    const response = await axios.post(`/paintings/upload`, formDataToSend, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Upload response:', response);
    setPaintings((prev) => [...prev, response.data]);
    setShowAddModal(false);
    alert('Нова картина додана');
  } catch (error) {
    console.error('Error adding painting:', error);
    alert('Помилка при додаванні');
  }
};


    const handleDeletePainting = async (paintingId) => {
        if (!window.confirm('Видалити цю картину?')) return;
        try {
            await axios.delete(`/paintings/delete/${paintingId}`);
            setPaintings(paintings.filter((p) => p.Painting_ID !== paintingId));
            alert('Картина видалена');
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Помилка при видаленні');
        }
    };

    return (
        <div className="gallery">
            {/* Добавить новую */}
            <div className="add-card" onClick={handleAddPainting}>
                + Додати картину
            </div>

            {/* Картины */}
            {paintings.map((painting) => (
                <div className="painting-card" key={painting.Painting_ID}>
                    <img src={painting.Image} alt={painting.title} className="painting-img" />
                    <div className="painting-info">
                        <h4>{painting.title}</h4>
                        <p className="author">
                            {painting.author_name} {painting.author_surname}
                        </p>
                        <div className="btn-row">
                            <button onClick={() => handleEditPainting(painting)} className="btn btn-info">
                                Редагувати
                            </button>
                            <button onClick={() => handleDeletePainting(painting.Painting_ID)} className="btn btn-danger">
                                Видалити
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Модалка */}
            {(showModal || showAddModal) && (
                <div className="custom-modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{showModal ? 'Редагувати картину' : 'Додати картину'}</h3>
                            <button
                                className="btn-close"
                                onClick={() => (showModal ? setShowModal(false) : setShowAddModal(false))}
                            >
                                ✖
                            </button>
                        </div>
                        <form onSubmit={showModal ? handleUpdatePainting : handleAddNewPainting}>
                            <label>Назва</label>
                            <input
                                type="text"
                                name="title"
                                className="form-input"
                                value={formData.title}
                                onChange={handleInputChange}
                            />
                            <label>Опис</label>
                            <textarea
                                name="description"
                                className="form-input"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                            <label>Зображення</label>
                            <input type="file" onChange={handleImageChange} className="form-input" />
                            {imagePreview && <img src={imagePreview} alt="preview" className="preview-img" />}
                            <button type="submit" className="btn btn-primary w-100">
                                {showModal ? 'Зберегти' : 'Додати'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GalleryArtist;
