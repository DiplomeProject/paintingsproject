import React, {useEffect, useState} from 'react';
import styles from './AddCommissionModal.module.css';
import closeIcon from '../../../assets/closeCross.svg';
import addImageIcon from '../../../assets/image-placeholder-icon.svg';

// ... (const categories, mockStyles, mockFormats) ...
const categories = ["2D AVATARS", "3D MODELS", "BOOKS", "ANIME", "ICONS", "GAMES", "MOCKUPS", "UI/UX"];
const mockStyles = ["Retro", "Cyberpunk", "Fantasy", "Minimalism", "3D Render"];
const mockFormats = ["PNG", "JPG", "Figma", "PSD", "AI"];

const AddCommissionModal = ({ onClose }) => {
    // --- Стан для полів форми ---
    const [name, setName] = useState('');
    const [category, setCategory] = useState(categories[0]);
    const [style, setStyle] = useState(mockStyles[0]);
    const [fileFormat, setFileFormat] = useState(mockFormats[0]);
    const [sizeW, setSizeW] = useState('');
    const [sizeH, setSizeH] = useState('');
    const [about, setAbout] = useState('');
    const [price, setPrice] = useState('');

    // --- Стан для зображень (1 головне + 4 прев'ю = 5) ---
    // Кожен елемент буде об'єктом { file: File, preview: 'blob:...' }
    const [mainImage, setMainImage] = useState(null);
    const [previews, setPreviews] = useState(new Array(4).fill(null));

    // --- Стан для помилок валідації ---
    const [errors, setErrors] = useState({});

    useEffect(() => {
        return () => {
            if (mainImage) URL.revokeObjectURL(mainImage.preview);
            previews.forEach(img => {
                if (img) URL.revokeObjectURL(img.preview);
            });
        };
    }, [mainImage, previews]);

    /* --- ДОДАНО: Валідація ціни (тільки цілі числа) --- */
    const handlePriceChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Залишаємо тільки цифри
        setPrice(value);
        if (errors.price) setErrors(prev => ({...prev, price: null}));
    };

    const handleSizeChange = (e, type) => {
        const value = e.target.value.replace(/\D/g, '');
        if (type === 'w') {
            setSizeW(value);
        } else {
            setSizeH(value);
        }
        if (errors.size) setErrors(prev => ({...prev, size: null}));
    };

    /* --- ДОДАНО: Обробник завантаження файлів --- */
    const handleFileChange = (e, type, index = -1) => {
        const file = e.target.files[0];
        if (!file) return;

        const previewURL = URL.createObjectURL(file);
        const newFile = { file, preview: previewURL };

        if (type === 'main') {
            setMainImage(newFile);
            if (errors.mainImage) setErrors(prev => ({...prev, mainImage: null}));
        } else if (type === 'preview') {
            const newPreviews = [...previews];
            newPreviews[index] = newFile;
            setPreviews(newPreviews);
        }
    };

    const handleImageDelete = (e, type, index = -1) => {
        e.stopPropagation(); // Зупиняємо клік, щоб не спрацював input file

        if (type === 'main') {
            // --- Видалення головного зображення ---
            URL.revokeObjectURL(mainImage.preview); // 1. Очистка пам'яті

            // 2. Знаходимо перше доступне прев'ю, щоб "підвищити" його
            const firstValidPreviewIndex = previews.findIndex(p => p !== null);

            if (firstValidPreviewIndex === -1) {
                // Якщо прев'ю немає, просто очищуємо mainImage
                setMainImage(null);
            } else {
                // 3. "Підвищуємо" перше прев'ю до mainImage
                const newMainImage = previews[firstValidPreviewIndex];
                setMainImage(newMainImage);

                // 4. Очищуємо слот прев'ю, звідки взяли зображення (БЕЗ ЗСУВУ)
                const newPreviews = [...previews];
                newPreviews[firstValidPreviewIndex] = null;
                setPreviews(newPreviews);
            }

        } else if (type === 'preview') {
            // --- Видалення прев'ю-зображення ---
            const newPreviews = [...previews];
            if (newPreviews[index]) {
                URL.revokeObjectURL(newPreviews[index].preview); // 1. Очистка пам'яті
            }

            // 2. Просто очищуємо слот (БЕЗ ЗСУВУ)
            newPreviews[index] = null;
            setPreviews(newPreviews);
        }
    };

    /* --- ДОДАНО: Функція валідації --- */
    const validate = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = "Name is required";
        if (!category) newErrors.category = "Category is required";
        if (!style) newErrors.style = "Style is required";
        if (!fileFormat) newErrors.fileFormat = "Format is required";
        if (!sizeW.trim() || !sizeH.trim()) newErrors.size = "Size is required";
        if (!about.trim()) newErrors.about = "About is required";
        if (!price.trim()) newErrors.price = "Price is required";
        if (!mainImage) newErrors.mainImage = "Main image is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleCreate = () => {
        // 1. Запускаємо валідацію
        if (!validate()) {
            console.log("Validation Failed", errors);
            return; // Зупиняємо відправку
        }

        // 2. Якщо валідація пройшла
        const allFiles = [mainImage, ...previews.filter(p => p)].map(p => p.file);
        console.log("Submitting data:", {
            name, category, style, fileFormat,
            size: `${sizeW}x${sizeH}`,
            about, price,
            files: allFiles
        });

        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.contentWrapper}>
                    <div className={styles.leftColumn}>

                        {/* --- ЗМІНЕНО: Додано оверлей для видалення --- */}
                        <div className={`${styles.imageUploadArea} ${errors.mainImage ? styles.errorBorder : ''}`}>
                            {mainImage ? (
                                <>
                                    <img src={mainImage.preview} alt="Main preview" className={styles.imagePreview} />
                                    <div className={styles.deleteOverlay} onClick={(e) => handleImageDelete(e, 'main')}>
                                        <img src={closeIcon} alt="Delete" className={styles.deleteIcon} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <img src={addImageIcon} alt="Upload" className={styles.uploadIcon} />
                                    <input type="file" accept="image/*" className={styles.fileInput} onChange={(e) => handleFileChange(e, 'main')} />
                                </>
                            )}
                        </div>
                        {errors.mainImage && <span className={styles.error}>{errors.mainImage}</span>}

                        {/* З'являється, тільки якщо mainImage завантажено */}
                        {mainImage && (
                            <div className={styles.previewRow}>
                                {previews.map((img, index) => (
                                    <div key={index} className={styles.previewImg}>
                                        {img ? (
                                            <>
                                                <img src={img.preview} alt={`preview ${index}`} className={styles.imagePreview} />
                                                <div className={styles.deleteOverlay} onClick={(e) => handleImageDelete(e, 'preview', index)}>
                                                    <img src={closeIcon} alt="Delete" className={styles.deleteIcon} />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <img src={addImageIcon} alt="preview slot" className={styles.uploadIconPreview} />
                                                <input type="file" accept="image/*" className={styles.fileInput} onChange={(e) => handleFileChange(e, 'preview', index)} />
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* --- ПРАВА КОЛОНКА (Поля вводу) --- */}
                    <div className={styles.rightColumn}>
                        <div className={styles.formGroup}>
                            <div className={styles.formHeader}>
                                <p>Name</p>
                                <button className={styles.closeBtn} onClick={onClose}>
                                    <img src={closeIcon} alt="Close" />
                                </button>
                            </div>

                            <input
                                type="text"
                                id="name"
                                className={`${styles.formInput} ${styles.formInputName} ${errors.name ? styles.errorBorderInput : ''}`}
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (errors.name) setErrors(prev => ({...prev, name: null}));
                                }}
                            />
                            {errors.name && <span className={styles.error}>{errors.name}</span>}
                        </div>
                        <div className={styles.formGroup}>
                            <p>Category</p>
                            <select
                                id="category"
                                className={styles.formSelect}
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <p>Style</p>
                            <select
                                id="style"
                                className={styles.formSelect}
                                value={style}
                                onChange={(e) => setStyle(e.target.value)}
                            >
                                {mockStyles.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <p>File format</p>
                            <select
                                id="fileFormat"
                                className={styles.formSelect}
                                value={fileFormat}
                                onChange={(e) => setFileFormat(e.target.value)}
                            >
                                {mockFormats.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <p>Size</p>
                            <div className={`${styles.sizeInputGroup} ${errors.size ? styles.errorBorderInput : ''}`}>

                                {/* --- ЗМІНЕНО: type="text" та onChange --- */}
                                <input
                                    type="text"
                                    value={sizeW}
                                    className={styles.formInput}
                                    onChange={(e) => handleSizeChange(e, 'w')}
                                    placeholder="W"
                                />
                                <span>X</span>

                                {/* --- ЗМІНЕНО: type="text" та onChange --- */}
                                <input
                                    type="text"
                                    value={sizeH}
                                    className={styles.formInput}
                                    onChange={(e) => handleSizeChange(e, 'h')}
                                    placeholder="H"
                                />
                            </div>
                            {errors.size && <span className={styles.error}>{errors.size}</span>}
                        </div>
                    </div>
                </div>

                {/* Поле 'About' */}
                <div className={styles.formGroup}>
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

                {/* --- КНОПКИ --- */}
                <div className={styles.actions}>
                    <div className={styles.priceInputWrapper}>
                        <input
                            type="text" // 'text' для кращого контролю через regex
                            className={`${styles.priceInput} ${errors.price ? styles.errorBorderInput : ''}`}
                            value={price}
                            onChange={handlePriceChange}
                            placeholder="Price"
                        />
                        {errors.price && <span className={styles.errorPrice}>{errors.price}</span>}
                    </div>
                    <button className={styles.createBtn} onClick={handleCreate}>Create</button>
                </div>
            </div>
        </div>
    );
};

export default AddCommissionModal;