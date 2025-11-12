import React, {useEffect, useState} from "react";
import styles from "./CommissionModalDetails.module.css";
import closeIcon from '../../../assets/closeCross.svg';
import axios from 'axios';

const CommissionModalDetails = ({ commission, onClose }) => {

    const [isLoading, setIsLoading] = useState(true);

    const [allImages, setAllImages] = useState(
        commission ? (commission.imageUrl ? [commission.imageUrl] : []) : []
    );
    const [mainImage, setMainImage] = useState(
        commission ? commission.imageUrl : null
    );

    useEffect(() => {
        if (commission && commission.id) {
            setIsLoading(true);

            const initialMain = commission.imageUrl || null;
            setMainImage(initialMain);
            setAllImages(initialMain ? [initialMain] : []);

            axios.get(`http://localhost:8080/api/commissions/${commission.id}`, { withCredentials: true })
                .then(response => {

                    if (response.data.success && response.data.commission && response.data.commission.images && response.data.commission.images.length > 0) {

                        setAllImages(response.data.commission.images);

                        const newMain = response.data.commission.images[0];
                        setMainImage(newMain);

                    }
                })
                .catch(err => {
                    console.error("Failed to fetch all commission images", err);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [commission]);

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

                                    alt={commission.title}

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

                                alt={commission.title}

                                className={styles.singleImage}
                                onError={onImageError}
                            />
                        )
                    )}

                    <div className={styles.info}>

                        {/* ВИПРАВЛЕНО: 'Title' -> 'title' */}
                        <p className={styles.title}>{commission.title}</p>

                        <p className={styles.field}>
                            {/* ВИПРАВЛЕНО: 'Category' -> 'category' */}
                            <span>Category</span> {commission.category}
                        </p>
                        <p className={styles.field}>
                            {/* ВИПРАВЛЕНО: 'Style' -> 'style' */}
                            <span>Style</span> {commission.style}
                        </p>
                        <p className={styles.field}>
                            {/* ВИПРАВЛЕНО: 'Format' -> 'fileFormat' */}
                            <span>File format</span> {commission.fileFormat}
                        </p>
                        <p className={styles.field}>
                            {/* ВИПРАВЛЕНО: 'Size' -> 'size' */}
                            <span>Size</span> {commission.size}
                        </p>
                    </div>
                </div>

                <div className={styles.about}>
                    <p>About</p>
                    {/* ВИПРАВЛЕНО: 'Description' -> 'description' */}
                    <span>{commission.description}</span>
                </div>

                <div className={styles.actions}>
                    {/* ВИПРАВЛЕНО: 'Price' -> 'price' */}
                    <button className={styles.priceBtn}>{commission.price}$</button>
                    <button className={styles.takeBtn}>Take</button>
                </div>
            </div>
        </div>
    );
}

export default CommissionModalDetails;