import React, {useCallback, useEffect, useState} from "react";
import styles from "./CommissionModalDetails.module.css";
import closeIcon from '../../../assets/closeCross.svg';
import axios from 'axios';
import ImageViewer from "../../ArtCard/ImageViewer/ImageViewer";
import logo from '../../../assets/logo.svg'

const CommissionModalDetails = ({ commission, onClose }) => {

    const [isLoading, setIsLoading] = useState(true);

    // --- НОВА ЛОГІКА СТАНУ ---
    // Головне зображення (з картки)
    const [mainImage, setMainImage] = useState(
        commission ? commission.imageUrl : null
    );
    // Зображення в нижньому ряду
    const [previewImages, setPreviewImages] = useState([]);

    // Стан для ImageViewer
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

    useEffect(() => {
        if (commission && commission.id) {
            setIsLoading(true);

            // Встановлюємо головне зображення з картки
            const initialMain = commission.imageUrl || null;
            setMainImage(initialMain);
            setPreviewImages([]); // Очищуємо прев'ю перед запитом

            axios.get(`http://localhost:8080/api/commissions/${commission.id}`, { withCredentials: true })
                .then(response => {
                    if (response.data.success && response.data.commission && response.data.commission.images) {

                        // Отримуємо ВСІ зображення з API
                        const fetchedImages = response.data.commission.images;

                        // Встановлюємо в прев'ю всі зображення з API,
                        // ОКРІМ того, яке ВЖЕ є головним
                        const newPreviewImages = fetchedImages.filter(img => img !== initialMain);

                        setPreviewImages(newPreviewImages);

                    }
                })
                .catch(err => {
                    console.error("Failed to fetch all commission images", err);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [commission]); // Залежність тільки від 'commission'

    // --- НОВА ЛОГІКА: "SWAP" (ОБМІН) ЗОБРАЖЕНЬ ---
    const handlePreviewClick = (clickedImage, clickedIndex) => {
        const currentMain = mainImage; // Зберігаємо поточне головне

        // Створюємо новий масив прев'ю
        const newPreviewImages = [...previewImages];

        // Ставимо старе головне зображення на місце, де було прев'ю
        newPreviewImages[clickedIndex] = currentMain;

        // Встановлюємо нове головне зображення
        setMainImage(clickedImage);

        // Оновлюємо рядок прев'ю
        setPreviewImages(newPreviewImages);
    };

    // --- ЛОГІКА ВІДКРИТТЯ ImageViewer ---
    const openImageViewer = useCallback(() => {
        // Усі доступні зображення: поточне головне + ті, що в прев'ю
        const allImagesForViewer = [mainImage, ...previewImages].filter(Boolean);

        // Знаходимо індекс поточного головного (зазвичай 0, але для безпеки)
        const currentIndex = allImagesForViewer.indexOf(mainImage);

        setViewerInitialIndex(currentIndex >= 0 ? currentIndex : 0);
        setIsViewerOpen(true);
    }, [mainImage, previewImages]);

    const closeImageViewer = useCallback(() => {
        setIsViewerOpen(false);
    }, []);

    if (!commission) {
        return null;
    }

    const onImageError = (e) => {
        if (!e.target.src.endsWith("/images/placeholder.png")) {
            e.target.src = "/images/placeholder.png";
        }
    };

    const handleAccept = async () => {
        if (!commission?.id) return;
        try {
            // const userId = localStorage.getItem('userId');
            // if (!userId) {
            //     alert("User not logged in");
            //     return;
            // }
            const response = await axios.patch(
                `http://localhost:8080/api/commissions/${commission.id}/accept`,
                {}, // Тіло запиту пусте, бекенд бере ID з сесії
                { withCredentials: true }
            );

            if (response.data.success) {
                alert("Commission accepted successfully!");
                onClose();
            }
        } catch (err) {
            console.error(err);
            // Якщо сесія прострочена, бекенд поверне 401, і ми це обробимо тут
            if (err.response && err.response.status === 401) {
                alert("Please log in to accept commissions.");
            } else {
                alert("Failed to accept commission: " + (err.response?.data?.message || err.message));
            }
        }
    };



    // Перевіряємо, чи є взагалі зображення для прев'ю
    const hasMultipleImages = previewImages.length > 0;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <img src={closeIcon} alt="Close" />
                </button>

                <div className={styles.topSection}>

                    {isLoading ? (
                        <div className={styles.loadingSpinnerContainer}>
                            <img src={logo} alt="Loading" className={styles.loadingLogo} />
                        </div>
                    ) : (
                        // Використовуємо .imageColumn, якщо є хоча б одне прев'ю
                        // або .singleImage, якщо є ТІЛЬКИ головне зображення
                        <div className={hasMultipleImages ? styles.imageColumn : styles.singleImageWrapper}>
                            <img
                                src={mainImage || "/images/placeholder.png"}
                                alt={commission.title}
                                // Використовуємо різні класи для компонування
                                className={hasMultipleImages ? styles.image : styles.singleImage}
                                onError={onImageError}
                                onClick={openImageViewer} // <-- ПОВЕРНУЛИ "ДРУГИЙ КЛІК"
                            />

                            {/* Рядок прев'ю показуємо ТІЛЬКИ якщо він не порожній */}
                            {hasMultipleImages && (
                                <div className={styles.previewRow}>
                                    {previewImages.map((img, index) => (
                                        <img
                                            key={index}
                                            src={img || "/images/placeholder.png"}
                                            alt={`preview ${index + 1}`}
                                            // .activePreview більше не потрібен
                                            className={styles.previewImg}
                                            // Викликаємо нову функцію "SWAP"
                                            onClick={() => handlePreviewClick(img, index)}
                                            onError={onImageError}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- ПРАВА КОЛОНКА (Без змін) --- */}
                    <div className={styles.info}>
                        <p className={styles.title}>{commission.title}</p>
                        <p className={styles.field}>
                            <span>Category</span> {commission.category}
                        </p>
                        <p className={styles.field}>
                            <span>Style</span> {commission.style}
                        </p>
                        <p className={styles.field}>
                            <span>File format</span> {commission.fileFormat}
                        </p>
                        <p className={styles.field}>
                            <span>Size</span> {commission.size}
                        </p>
                    </div>
                </div>

                {/* --- НИЖНЯ ЧАСТИНА (Без змін) --- */}
                <div className={styles.about}>
                    <p>About</p>
                    <span>{commission.description}</span>
                </div>

                <div className={styles.actions}>
                    <button className={styles.priceBtn}>{commission.price}$</button>
                    <button className={styles.takeBtn} onClick={handleAccept}>Accept</button>
                </div>

            </div>

            {isViewerOpen && (
                <ImageViewer
                    images={[mainImage, ...previewImages].filter(Boolean)}
                    initialImageIndex={viewerInitialIndex}
                    onClose={closeImageViewer}
                />
            )}
        </div>
    );
}

export default CommissionModalDetails;