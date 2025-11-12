import React, {useEffect} from 'react';
import styles from './ArtDetailsModal.module.css';
import closeIcon from '../../../assets/closeCross.svg'; // Шлях до іконки "X"

const ArtDetailsModal = ({art, onClose}) => {
    // Блокуємо прокрутку фону, коли модалка відкрита
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto'; // Повертаємо прокрутку
        };
    }, []);

    // Обробник кліку на оверлей (для закриття)
    const handleOverlayClick = (e) => {
        // Закриваємо, тільки якщо клік був на самому оверлеї, а не на модалці
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Перевірка наявності декількох зображень
    const imagesToShow = art.images && art.images.length > 0 ? art.images : [art.imageUrl];

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <img src={closeIcon} alt="Close"/>
                </button>

                <div className={styles.modalContent}>
                    {/* --- Ліва колонка (Зображення) --- */}
                    <div className={styles.leftColumn}>
                        {imagesToShow.map((imgUrl, index) => (
                            <img
                                key={index}
                                src={imgUrl}
                                alt={`${art.title} preview ${index + 1}`}
                                className={styles.artImage}
                            />
                        ))}
                    </div>

                    {/* --- Права колонка (Інформація) --- */}
                    <div className={styles.rightColumn}>
                        <h2 className={styles.title}>{art.title}</h2>
                        <p className={styles.artistName}>{art.artistName}</p>

                        <div className={styles.detailsList}>
                            <p className={styles.field}><span>Category</span> {art.category}</p>
                            <p className={styles.field}><span>Style</span> {art.style}</p>
                            <p className={styles.field}><span>File format</span> {art.fileFormat}</p>
                            <p className={styles.field}><span>Size</span> {art.size}</p>
                        </div>

                        <p className={styles.description}>
                            {art.description}
                        </p>

                        <div className={styles.actions}>
                            <div className={styles.price}>
                                <p>
                                    <svg width="24" height="24" viewBox="0 0 24 24" /* ... (іконка $) ... */>
                                        <g transform="translate(5 0) scale(1.3333 1.3333) translate(-7 -3)">
                                            <path
                                                d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-.9.6-1.75 2.1-1.75 1.7 0 2.2.8 2.3 2.1h2.1c-.1-1.7-1.1-3.2-3-3.8V3h-3v2.1c-1.9.5-3.1 1.9-3.1 3.8 0 2.2 1.8 3.4 4.5 4 2.8.6 3 1.3 3 2.2 0 1-.6 1.8-2.2 1.8-1.8 0-2.3-.9-2.4-2.1H7c.1 1.7 1.1 3.2 3.1 3.8V21h3v-2.1c1.9-.5 3.1-1.9 3.1-3.8 0-2.3-1.8-3.5-4.6-4.1z"/>
                                        </g>
                                    </svg>
                                    {art.price}
                                </p>
                                <button className={styles.buyBtn}>Buy</button>
                            </div>

                            <div className={styles.likes}>
                                <span>
                                    <svg
                                        width="17"
                                        height="17"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                        <path
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                                    {art.likes}
                                </span>

                                <button className={styles.likeBtn}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white"
                                         strokeWidth="2" /* ... (іконка серця) ... */>
                                        <path
                                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                    </svg>
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtDetailsModal;