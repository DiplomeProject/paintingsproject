import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from "react-bootstrap/Card";

function GalleryArtist({ user }) {
    const [paintings, setPaintings] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false); // Состояние для модального окна добавления
    const [selectedPainting, setSelectedPainting] = useState(null); // Хранит выбранную картину для редактирования
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null,
    });
    const [imagePreview, setImagePreview] = useState('img/icons/add_image.jpg');

    useEffect(() => {
        const loadPaintings = async () => {
            try {
                const response = await axios.get('http://localhost:8080/loadPaintAuthor', { withCredentials: true });
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
            setImagePreview(URL.createObjectURL(file)); // Показываем предпросмотр
        }
    };

    const handleEditPainting = (painting) => {
        setSelectedPainting(painting); // Устанавливаем текущую картину
        setFormData({
            title: painting.title,
            description: painting.description,
            image: null,
        });
        setImagePreview(painting.Image);
        setShowModal(true); // Открываем модальное окно для редактирования
    };

    const handleAddPainting = () => {
        setFormData({
            title: '',
            description: '',
            image: null,
        });
        setImagePreview('img/icons/add_image.jpg');
        setShowAddModal(true); // Открываем модальное окно для добавления картины
    };

    const handleUpdatePainting = async (e) => {
        e.preventDefault();

        if (!selectedPainting) {
            alert('Картина не выбрана для редактирования');
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            const response = await axios.put(`http://localhost:8080/paintings/${selectedPainting.Painting_ID}`, formDataToSend, {
                withCredentials: true,
            });

            // Обновляем список картин после успешного редактирования
            setPaintings((prevPaintings) =>
                prevPaintings.map((painting) =>
                    painting.Painting_ID === selectedPainting.Painting_ID ? response.data : painting
                )
            );

            setShowModal(false); // Закрываем модальное окно
            alert('Картина успешно обновлена');
        } catch (error) {
            console.error('Error updating the painting:', error);
            alert('Ошибка при обновлении картины');
        }
    };

    const handleAddNewPainting = async (e) => {
        e.preventDefault();

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            const response = await axios.post('http://localhost:8080/upload', formDataToSend, {
                withCredentials: true,
            });

            // Добавляем новую картину в список
            setPaintings((prevPaintings) => [...prevPaintings, response.data]);

            setShowAddModal(false); // Закрываем модальное окно добавления
            alert('Новая картина успешно добавлена');
        } catch (error) {
            console.error('Error adding the painting:', error);
            alert('Ошибка при добавлении картины');
        }
    };

    const handleDeletePainting = async (paintingId) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту картину?')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/paintings/${paintingId}`, { withCredentials: true });
            setPaintings(paintings.filter(painting => painting.Painting_ID !== paintingId));
            alert('Картина успешно удалена');
        } catch (error) {
            console.error('Error deleting the painting:', error);
            alert('Ошибка при удалении картины');
        }
    };

    return (
        <div className="gallery container py-3">
            <div className="row g-3">
                {/* Карточка для добавления новой картины */}
                <div className="col-6 col-md-4 col-lg-3">
                    <div
                        className="d-flex align-items-center justify-content-center border border-2 border-dashed rounded h-100 p-3"
                        style={{
                            cursor: 'pointer',
                            minHeight: '220px',
                            borderStyle: 'dashed',
                            color: '#888'
                        }}
                        onClick={handleAddPainting}
                    >
                        <span className="text-center">+ Додати картину</span>
                    </div>
                </div>

                {/* Существующие картины */}
                {paintings.map(painting => (
                    <div className="col-6 col-md-4 col-lg-3" key={painting.Painting_ID}>
                        <Card
                            className="h-100 shadow-sm"
                            style={{
                                borderRadius: '10px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                            onClick={() => console.log('Show details', painting)}
                        >
                            <Card.Img
                                variant="top"
                                src={painting.Image}
                                alt={painting.title}
                                style={{ height: '150px', objectFit: 'cover' }}
                            />
                            <Card.Body className="d-flex flex-column justify-content-between">
                                <div>
                                    <Card.Title className="mb-1">{painting.title}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        {painting.author_name} {painting.author_surname}
                                    </Card.Subtitle>
                                </div>
                                <div className="d-flex gap-2 mt-2">
                                    <button
                                        onClick={e => { e.stopPropagation(); handleEditPainting(painting); }}
                                        className="btn btn-sm btn-info flex-fill"
                                    >
                                        Редагувати
                                    </button>
                                    <button
                                        onClick={e => { e.stopPropagation(); handleDeletePainting(painting.Painting_ID); }}
                                        className="btn btn-sm btn-danger flex-fill"
                                    >
                                        Видалити
                                    </button>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Модальные окна */}
            {(showModal || showAddModal) && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{showModal ? 'Редагувати картину' : 'Додати картину'}</h5>
                                <button type="button" className="btn-close" onClick={() => showModal ? setShowModal(false) : setShowAddModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={showModal ? handleUpdatePainting : handleAddNewPainting}>
                                    <div className="mb-3">
                                        <label htmlFor="title" className="form-label">Назва</label>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            className="form-control"
                                            value={formData.title || (selectedPainting?.title || '')}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label">Опис</label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            className="form-control"
                                            value={formData.description || ''}
                                            onChange={handleInputChange}
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="image" className="form-label">Зображення</label>
                                        <input type="file" className="form-control" onChange={handleImageChange} />
                                        {imagePreview && (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="img-fluid mt-2"
                                                style={{ width: '120px', borderRadius: '5px' }}
                                            />
                                        )}
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100">
                                        {showModal ? 'Зберегти зміни' : 'Додати картину'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GalleryArtist;
