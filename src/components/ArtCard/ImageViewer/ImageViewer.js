import React, { useState, useEffect, useCallback } from 'react';
import styles from './ImageViewer.module.css'; // Створимо CSS для цього компонента

const ImageViewer = ({ images, initialImageIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialImageIndex);

    // Оновлення початкового індексу, якщо він змінюється
    useEffect(() => {
        setCurrentIndex(initialImageIndex);
    }, [initialImageIndex]);

    const currentImage = images[currentIndex];

    const goToNext = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, [images.length]);

    const goToPrev = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }, [images.length]);

    // Обробка натискань клавіш (стрілки, Esc)
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowRight') {
                goToNext();
            } else if (event.key === 'ArrowLeft') {
                goToPrev();
            } else if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [goToNext, goToPrev, onClose]);


    if (!currentImage) return null; // Не рендерити, якщо немає зображення

    return (
        <div className={styles.viewerOverlay} onClick={onClose}>
            <div className={styles.viewerContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                <img src={currentImage} alt={`Full view ${currentIndex + 1}`} className={styles.fullImage} />

                {images.length > 1 && ( // Показувати стрілки, тільки якщо є більше одного зображення
                    <>
                        <button className={styles.navButton + ' ' + styles.prev} onClick={goToPrev}>
                            &#10094; {/* Ліва стрілка */}
                        </button>
                        <button className={styles.navButton + ' ' + styles.next} onClick={goToNext}>
                            &#10095; {/* Права стрілка */}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ImageViewer;