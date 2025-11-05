import React, {useEffect, useState} from "react";
import styles from "./CommissionModal.module.css";

const CommissionModal = ({ commission, onClose, variant = "basic" }) => {
    const [mainImage, setMainImage] = useState(commission ? commission.image : null);

    useEffect(() => {
        if (commission) {
            setMainImage(commission.image);
        }
    }, [commission]);

    if (!commission) {
        return null;
    }

    const allPreviews = [commission.image, ...(commission.previews || [])];
    const uniquePreviews = [...new Set(allPreviews)];
    const hasMultipleImages = uniquePreviews.length > 1;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <img src="/assets/closeCross.svg" alt="Close" />
                </button>

                <div className={styles.topSection}>
                    {hasMultipleImages ? (

                        // 1. ВАРІАНТ: Декілька картинок (як на дизайні)
                        <div className={styles.imageColumn}>
                            <img
                                src={mainImage}
                                alt={commission.title}
                                className={styles.image} // Головна картинка
                            />
                            {/* Рядок з прев'юшками */}
                            <div className={styles.previewRow}>
                                {uniquePreviews.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt={`preview ${index + 1}`}
                                        className={`${styles.previewImg} ${img === mainImage ? styles.activePreview : ''}`}
                                        onClick={() => setMainImage(img)}
                                    />
                                ))}
                            </div>
                        </div>

                    ) : (

                        // 2. ВАРІАНТ: Тільки одна картинка
                        <img
                            src={mainImage}
                            alt={commission.title}
                            className={styles.singleImage} // Клас для великої картинки
                        />
                    )}

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

                <div className={styles.about}>
                    <p>About</p>
                    <span>{commission.about}</span>
                    {/*<p className={styles.feelings}>*/}
                    {/*    <b>Feelings:</b> {commission.feelings}*/}
                    {/*</p>*/}
                </div>

                <div className={styles.actions}>
                    <button className={styles.priceBtn}>{commission.price}$</button>
                    <button className={styles.takeBtn}>Take</button>
                </div>
            </div>
        </div>
    );
}

export default CommissionModal;
