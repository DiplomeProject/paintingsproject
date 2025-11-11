import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./CommissionModalDetails.module.css";
import closeIcon from '../../../assets/closeCross.svg';

const CommissionModalDetails = ({ commission, onClose }) => {
    const [images, setImages] = useState([]);
    const [mainImage, setMainImage] = useState(commission.imageSrc || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!commission?.id) return;
        const fetchDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/commissions/${commission.id}`, {
                    withCredentials: true
                });
                if (response.data.success && response.data.commission) {
                    setImages(response.data.commission.images || []);
                    setMainImage(response.data.commission.images?.[0] || commission.imageSrc);
                } else {
                    setImages([commission.imageSrc]);
                }
            } catch (err) {
                console.error("Error loading full commission details:", err);
                setImages([commission.imageSrc]);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [commission]);

    if (!commission) return null;
    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <img src={closeIcon} alt="Close" />
                </button>

                <div className={styles.topSection}>
                    {images.length > 1 ? (
                        <div className={styles.imageColumn}>
                            <img src={mainImage} alt={commission.title} className={styles.image} />
                            <div className={styles.previewRow}>
                                {images.map((img, i) => (
                                    <img
                                        key={i}
                                        src={img}
                                        alt={`preview ${i}`}
                                        className={`${styles.previewImg} ${img === mainImage ? styles.activePreview : ''}`}
                                        onClick={() => setMainImage(img)}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <img src={mainImage} alt={commission.title} className={styles.singleImage} />
                    )}

                    <div className={styles.info}>
                        <p className={styles.title}>{commission.title}</p>
                        <p><span>Category</span> {commission.category}</p>
                        <p><span>Style</span> {commission.style}</p>
                        <p><span>File format</span> {commission.fileFormat}</p>
                        <p><span>Size</span> {commission.size}</p>
                    </div>
                </div>

                <div className={styles.about}>
                    <p>About</p>
                    <span>{commission.about}</span>
                </div>

                <div className={styles.actions}>
                    <button className={styles.priceBtn}>{commission.price}$</button>
                    <button className={styles.takeBtn}>Take</button>
                </div>
            </div>
        </div>
    );
};

export default CommissionModalDetails;
