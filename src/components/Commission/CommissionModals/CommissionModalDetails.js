import React, {useEffect, useState} from "react";
import styles from "./CommissionModalDetails.module.css";
import closeIcon from '../../../assets/closeCross.svg';
import axios from 'axios';

const CommissionModalDetails = ({ commission, onClose }) => {

    // 1. Стан для індикатора завантаження
    const [isLoading, setIsLoading] = useState(true);

    // 2. Початковий стан - 'allImages' містить ТІЛЬКИ головне зображення, яке прийшло
    const [allImages, setAllImages] = useState(
        commission ? (commission.imageUrl ? [commission.imageUrl] : []) : []
    );
    // 3. Головне зображення встановлюємо одразу з пропсів
    const [mainImage, setMainImage] = useState(
        commission ? commission.imageUrl : null
    );

    // 4. Завантажуємо решту зображень, коли модалка відкривається
    useEffect(() => {
        if (commission && commission.id) {
            setIsLoading(true);

            // Встановлюємо початковий стан з пропсів
            const initialMain = commission.imageUrl || null;
            setMainImage(initialMain);
            setAllImages(initialMain ? [initialMain] : []);

            // Робимо запит на всі зображення, використовуючи НОВИЙ РОУТ
            axios.get(`http://localhost:8080/api/commissions/${commission.id}/images`, { withCredentials: true })
                .then(response => {
                    if (response.data.success && response.data.images.length > 0) {
                        // Ми отримали повний масив зображень
                        setAllImages(response.data.images);
                        // Переконуємось, що головне зображення - це перше з отриманих
                        setMainImage(response.data.images[0]);
                    }
                    // Якщо зображень немає (окрім головного), залишаємо як є
                })
                .catch(err => {
                    console.error("Failed to fetch all commission images", err);
                    // У разі помилки, просто покажемо головне зображення, яке вже є
                })
                .finally(() => {
                    setIsLoading(false); // Завершуємо завантаження
                });
        }
    }, [commission]); // Залежність від 'commission'

    // 5. hasMultipleImages тепер динамічно розраховується
    const hasMultipleImages = allImages.length > 1;

    if (!commission) {
        return null;
    }

    const onImageError = (e) => {
        if (!e.target.src.endsWith("/images/placeholder.png")) {
            e.target.src = "/images/placeholder.png";
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <img src={closeIcon} alt="Close" />
                </button>

                <div className={styles.topSection}>

                    {isLoading ? (
                        <div className={`${styles.imageColumn} ${styles.loadingContainer}`}>
                            <p>Loading images...</p>
                        </div>
                    ) : (
                        hasMultipleImages ? (
                            <div className={styles.imageColumn}>
                                <img
                                    src={mainImage || "/images/placeholder.png"}

                                    // --- ВИПРАВЛЕНО ---
                                    alt={commission.Title}

                                    className={styles.image}
                                    onError={onImageError}
                                />
                                <div className={styles.previewRow}>
                                    {allImages.map((img, index) => (
                                        <img
                                            key={index}
                                            src={img || "/images/placeholder.png"}
                                            alt={`preview ${index + 1}`}
                                            className={`${styles.previewImg} ${img === mainImage ? styles.activePreview : ''}`}
                                            onClick={() => setMainImage(img)}
                                            onError={onImageError}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <img
                                src={mainImage || "/images/placeholder.png"}

                                alt={commission.Title}

                                className={styles.singleImage}
                                onError={onImageError}
                            />
                        )
                    )}
                    <div className={styles.info}>
                        <p className={styles.title}>{commission.Title}</p>
                        <p className={styles.field}>
                            <span>Category</span> {commission.Category}
                        </p>
                        <p className={styles.field}>
                            <span>Style</span> {commission.Style}
                        </p>
                        <p className={styles.field}>
                            <span>File format</span> {commission.Format}
                        </p>
                        <p className={styles.field}>
                            <span>Size</span> {commission.Size}
                        </p>
                    </div>
                </div>

                <div className={styles.about}>
                    <p>About</p>

                    {/* --- ВИПРАВЛЕНО --- */}
                    <span>{commission.Description}</span>

                </div>

                <div className={styles.actions}>

                    {/* --- ВИПРАВЛЕНО --- */}
                    <button className={styles.priceBtn}>{commission.Price}$</button>

                    <button className={styles.takeBtn}>Take</button>
                </div>
            </div>
        </div>
    );
}

export default CommissionModalDetails;