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
        <div className="gallery">
            <div className="row pt-1">
                <div className="add mb-3" onClick={handleAddPainting} style={{width: "18rem",
                    border: '2px dashed #ccc',
                    borderRadius: "10px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}>
                </div>
                {paintings.map(painting => (
                    <div className="col-6 mb-3" key={painting.Painting_ID}>
                        <Card
                            className="item"
                            style={{
                                width: "18rem",
                                background: "transparent",
                                borderRadius: "10px",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                                overflow: "hidden"
                            }}
                            onClick={() => console.log('Show details', painting)}
                        >
                            <Card.Img
                                variant="top"
                                src={painting.Image}
                                alt={painting.title}
                                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                            />
                            <Card.Body className="info">
                                <Card.Title>{painting.title}</Card.Title>
                                <Card.Title>{painting.author_name} {painting.author_surname}</Card.Title>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditPainting(painting);
                                    }}
                                    className="btn btn-info"
                                >
                                    Редагувати
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePainting(painting.Painting_ID);
                                    }}
                                    className="btn btn-danger"
                                >
                                    Видалити
                                </button>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Модальное окно редактирования картины */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.7)'}} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Редактировать картину</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleUpdatePainting}>
                                    <div className="mb-3">
                                        <label htmlFor="title" className="form-label">Название</label>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            className="form-control"
                                            value={formData.title || selectedPainting.title}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label">Описание</label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            className="form-control"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="image" className="form-label">Изменить изображение</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={handleImageChange}
                                        />
                                        {imagePreview && (
                                            <img
                                                src={imagePreview}
                                                alt="Image preview"
                                                className="img-fluid mt-3"
                                                style={{ width: '100px' }}
                                            />
                                        )}
                                    </div>
                                    <button type="submit" className="btn btn-primary">Сохранить изменения</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно добавления новой картины */}
            {showAddModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.7)' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Добавить картину</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowAddModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleAddNewPainting}>
                                    <div className="mb-3">
                                        <label htmlFor="title" className="form-label">Название</label>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            className="form-control"
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label">Описание</label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            className="form-control"
                                            onChange={handleInputChange}
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="image" className="form-label">Выберите изображение</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={handleImageChange}
                                        />
                                        {imagePreview && (
                                            <img
                                                src={imagePreview}
                                                alt="Image preview"
                                                className="img-fluid mt-3"
                                                style={{ width: '100px' }}
                                            />
                                        )}
                                    </div>
                                    <button type="submit" className="btn btn-primary">Добавить картину</button>
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
