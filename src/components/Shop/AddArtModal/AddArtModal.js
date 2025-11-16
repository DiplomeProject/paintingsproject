import React, {useEffect, useState, useRef} from 'react';
import styles from './AddArtModal.module.css';
import axios from "axios";
import closeIcon from '../../../assets/closeCross.svg';
import addImageIcon from '../../../assets/image-placeholder-icon.svg';

// --- Хелпер для опцій (без змін) ---
const getOptions = (config, title) => {
    const section = config.find(f => f.title === title);
    if (section && section.options[0] && section.options[0].subOptions) {
        return section.options[0].subOptions;
    }
    return [];
};

// --- ЛОГІКА ПЛАВНОЇ ПРОКРУТКИ (з ArtDetailsModal) ---
const lerp = (current, target, factor) => {
    return current * (1 - factor) + target * factor;
};

const AddArtModal = ({ onClose, categories, filterConfig }) => {

    const styleOptions = getOptions(filterConfig, "STYLE");
    const formatOptions = getOptions(filterConfig, "FORMAT");

    // --- Стан полів ---
    const [name, setName] = useState('');
    const [category, setCategory] = useState(categories[0] || '');
    const [style, setStyle] = useState('');
    const [fileFormat, setFileFormat] = useState('');
    const [sizeW, setSizeW] = useState('');
    const [sizeH, setSizeH] = useState('');
    const [about, setAbout] = useState('');
    const [price, setPrice] = useState('');

    // --- Стан зображень ---
    const [images, setImages] = useState([]);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // --- REFS ТА ЛОГІКА ПРОКРУТКИ ---
    const leftColumnRef = useRef(null);
    const rightFormRef = useRef(null); // Перейменовано з rightInfoRef
    const leftScroll = useRef({current: 0, target: 0});
    const rightScroll = useRef({current: 0, target: 0});
    const animationFrameId = useRef(null);
    const lerpFactor = 0.1;

    // --- БЛОКУВАННЯ ПРОКРУТКИ ФОНУ ---
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        startScrollAnimation();

        return () => {
            document.body.style.overflow = 'auto';
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, []);

    // Очистка Object URL
    useEffect(() => {
        return () => {
            images.forEach(img => URL.revokeObjectURL(img.preview));
        };
    }, [images]);

    // --- ФУНКЦІЇ ПРОКРУТКИ (з ArtDetailsModal) ---
    const smoothScrollLoop = () => {
        let leftNeedsUpdate = false;
        let rightNeedsUpdate = false;

        if (leftColumnRef.current) {
            const {current, target} = leftScroll.current;
            if (Math.abs(target - current) > 0.1) {
                leftScroll.current.current = lerp(current, target, lerpFactor);
                leftColumnRef.current.scrollTop = leftScroll.current.current;
                leftNeedsUpdate = true;
            } else if (current !== target) {
                leftScroll.current.current = target;
                leftColumnRef.current.scrollTop = target;
            }
        }

        // Використовуємо rightFormRef
        if (rightFormRef.current) {
            const {current, target} = rightScroll.current;
            if (Math.abs(target - current) > 0.1) {
                rightScroll.current.current = lerp(current, target, lerpFactor);
                rightFormRef.current.scrollTop = rightScroll.current.current;
                rightNeedsUpdate = true;
            } else if (current !== target) {
                rightScroll.current.current = target;
                rightFormRef.current.scrollTop = target;
            }
        }

        if (leftNeedsUpdate || rightNeedsUpdate) {
            animationFrameId.current = requestAnimationFrame(smoothScrollLoop);
        } else {
            animationFrameId.current = null;
        }
    };

    const startScrollAnimation = () => {
        if (!animationFrameId.current) {
            animationFrameId.current = requestAnimationFrame(smoothScrollLoop);
        }
    };

    const handleWheelScroll = (e) => {
        const scrollAmount = e.deltaY;
        let didAnimate = false;

        if (leftColumnRef.current) {
            const { scrollHeight, clientHeight } = leftColumnRef.current;
            if (scrollHeight > clientHeight) {
                const maxScroll = scrollHeight - clientHeight;
                const currentTarget = leftScroll.current.target;

                const newTarget = Math.max(0, Math.min(currentTarget + scrollAmount, maxScroll));

                if (newTarget !== currentTarget) {
                    leftScroll.current.target = newTarget;
                    didAnimate = true;
                }
            }
        }

        if (rightFormRef.current) {
            const { scrollHeight, clientHeight } = rightFormRef.current;
            if (scrollHeight > clientHeight) {
                const maxScroll = scrollHeight - clientHeight;
                const currentTarget = rightScroll.current.target;

                const newTarget = Math.max(0, Math.min(currentTarget + scrollAmount, maxScroll));

                if (newTarget !== currentTarget) {
                    rightScroll.current.target = newTarget;
                    didAnimate = true;
                }
            }
        }

        if (didAnimate) {
            e.preventDefault();
            startScrollAnimation();
        }
    };

    // --- Обробники полів (без змін) ---
    const handlePriceChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setPrice(value);
        if (errors.price) setErrors(prev => ({...prev, price: null}));
    };
    const handleSizeChange = (e, type) => {
        const value = e.target.value.replace(/\D/g, '');
        if (type === 'w') setSizeW(value);
        else setSizeH(value);
        if (errors.size) setErrors(prev => ({...prev, size: null}));
    };

    // --- Обробники файлів (без змін) ---
    const handleFileAdd = (e) => {
        // 1. Перевіряємо, чи є файли
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }

        // 2. Конвертуємо FileList в масив
        const files = Array.from(e.target.files);

        // 3. Створюємо нові об'єкти файлів з URL для прев'ю
        const newFileObjects = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setImages(prevImages => [...newFileObjects.reverse(), ...prevImages]);

        if (errors.images) setErrors(prev => ({...prev, images: null}));

        // 5. Очищуємо input
        e.target.value = null;
    };

    const handleImageDelete = (e, index) => {
        e.stopPropagation();
        const newImages = [...images];
        const removedImage = newImages.splice(index, 1)[0];
        if (removedImage) {
            URL.revokeObjectURL(removedImage.preview);
        }
        setImages(newImages);
    };

    // --- Валідація (без змін) ---
    const validate = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = "Name is required";
        if (!category) newErrors.category = "Category is required";
        if (!style) newErrors.style = "Style is required";
        if (!fileFormat) newErrors.fileFormat = "Format is required";
        if (!sizeW.trim() || !sizeH.trim()) newErrors.size = "Size is required";
        if (!about.trim()) newErrors.about = "About is required";
        if (!price.trim()) newErrors.price = "Price is required";
        if (images.length === 0) newErrors.images = "At least one image is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- Відправка форми (без змін) ---
    const handleAddArt = async () => {
        if (!validate()) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("title", name);
            formData.append("description", about);
            formData.append("category", category);
            formData.append("style", style);
            formData.append("size", `${sizeW}x${sizeH}`);
            formData.append("format", fileFormat);
            formData.append("price", price);

            if (images.length > 0) {
                formData.append("referenceImage", images[0].file);
            }
            if (images.length > 1) {
                images.slice(1).forEach((img, index) => {
                    formData.append(`image${index + 2}`, img.file);
                });
            }

            const response = await axios.post("http://localhost:8080/api/art/public", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true
            });

            if (response.data.success) {
                alert("Art added successfully!");
                onClose();
                window.location.reload();
            } else {
                alert((response.data.message || "Failed to add art"));
            }
        } catch (error) {
            console.error("Error adding art:", error);
            alert("Server error while adding art");
        } finally {
            setSubmitting(false);
        }
    };

    // Клік по оверлею
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>

            {/* --- НОВИЙ КОНТЕЙНЕР, ЯКИЙ ІМІТУЄ ArtDetailsModal --- */}
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} onWheel={handleWheelScroll}>

                {/* --- КНОПКА ЗАКРИТТЯ З ArtDetailsModal --- */}
                <button className={styles.closeBtnFixed} onClick={onClose}>
                    <img src={closeIcon} alt="Close"/>
                </button>

                {/* --- ЛІВА КОЛОНКА (ТІЛЬКИ ЗОБРАЖЕННЯ) --- */}
                <div className={styles.leftColumn} ref={leftColumnRef}>

                    {/* 1. Головний завантажувач (завжди видимий) */}
                    <div className={`${styles.imageUploadArea} ${errors.images ? styles.errorBorder : ''}`}>
                        <img src={addImageIcon} alt="Upload" className={styles.uploadIcon} />
                        <input
                            type="file"
                            accept="image/*"
                            className={styles.fileInput}
                            onChange={handleFileAdd}
                            multiple
                        />
                    </div>
                    {errors.images && !images.length && <span className={styles.error}>{errors.images}</span>}

                    {/* 2. Стек вже завантажених зображень */}
                    <div className={styles.imageStack}>
                        {images.map((img, index) => (
                            <div key={index} className={styles.stackImagePreview}>
                                <img src={img.preview} alt={`preview ${index}`} className={styles.imagePreview} />
                                <div className={styles.deleteOverlay} onClick={(e) => handleImageDelete(e, index)}>
                                    <img src={closeIcon} alt="Delete" className={styles.deleteIcon} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- ПРАВА КОЛОНКА (ФОРМА + ДІЇ) --- */}
                <div className={styles.rightColumn}>
                    <div className={styles.scrollableForm} ref={rightFormRef}>
                        <div className={styles.formGroup}>
                            <div className={styles.formHeader}>
                                <p>Name</p>
                            </div>
                            {/* --- ЗМІНЕНО: <input> став <textarea> --- */}
                            <textarea
                                id="name"
                                className={`${styles.formInput} ${styles.formInputName} ${errors.name ? styles.errorBorderInput : ''}`}
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (errors.name) setErrors(prev => ({...prev, name: null}));
                                }}
                                maxLength={150} // Ліміт символів
                                rows={2} // Висота у 2 рядки
                                placeholder="Enter art name..."
                            />
                            {/* --- ДОДАНО: Лічильник символів --- */}
                            <span className={styles.charCounter}>{name.length} / 150</span>

                            {/* Повідомлення про помилку тепер йде після лічильника */}
                            {errors.name && <span className={styles.error}>{errors.name}</span>}
                        </div>
                        <div className={styles.formGroup}>
                            <p>Category</p>
                            <select id="category" className={styles.formSelect} value={category} onChange={(e) => setCategory(e.target.value)}>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <p>Style</p>
                            <select id="style" className={styles.formSelect} value={style} onChange={(e) => setStyle(e.target.value)}>
                                <option value="">Select style...</option>
                                {styleOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <p>File format</p>
                            <select id="fileFormat" className={styles.formSelect} value={fileFormat} onChange={(e) => setFileFormat(e.target.value)}>
                                <option value="">Select format...</option>
                                {formatOptions.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <p>Size</p>
                            <div className={`${styles.sizeInputGroup} ${errors.size ? styles.errorBorderInput : ''}`}>
                                <input type="text" value={sizeW} className={styles.formInput} onChange={(e) => handleSizeChange(e, 'w')} placeholder="W"/>
                                <span>X</span>
                                <input type="text" value={sizeH} className={styles.formInput} onChange={(e) => handleSizeChange(e, 'h')} placeholder="H"/>
                            </div>
                            {errors.size && <span className={styles.error}>{errors.size}</span>}
                        </div>

                        <div className={`${styles.formGroup} ${styles.aboutGroup}`}>
                            <p>About</p>
                            <textarea
                                id="about"
                                className={`${styles.formInput} ${styles.formInputAbout} ${errors.about ? styles.errorBorder : ''}`}
                                value={about}
                                onChange={(e) => {
                                    setAbout(e.target.value);
                                    if (errors.about) setErrors(prev => ({...prev, about: null}));
                                }}
                            />
                            {errors.about && <span className={styles.error}>{errors.about}</span>}
                        </div>

                        {/* --- ПЕРЕМІЩЕНО СЮДИ --- */}
                        {/* Блок .actions тепер є частиною .scrollableForm */}
                        <div className={styles.actions}>
                            <div className={styles.priceInputWrapper}>
                                <input
                                    type="text"
                                    className={`${styles.priceInput} ${errors.price ? styles.errorBorderInput : ''}`}
                                    value={price}
                                    onChange={handlePriceChange}
                                    placeholder="Price"
                                />
                                {errors.price && <span className={styles.errorPrice}>{errors.price}</span>}
                            </div>
                            <button className={styles.createBtn} onClick={handleAddArt} disabled={submitting}>
                                {submitting ? 'Uploading...' : 'Add'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AddArtModal;