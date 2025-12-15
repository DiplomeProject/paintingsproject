import React, {useEffect, useState, useRef, useCallback} from 'react';
import axios from 'axios';
import styles from './CommissionChat.module.css';
import placeholderImg from '../../../../../../assets/image-placeholder-icon.svg';
import ImageViewer from "../../../../../ArtCard/ImageViewer/ImageViewer";
// Іконки
const CheckIcon = () => (<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>);
const CrossIcon = () => (<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>);

const CommissionChat = ({ commissionId, user, onBack }) => {
    const [commission, setCommission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('Sketch');
    const [pendingStageImage, setPendingStageImage] = useState(null);
    const fileInputRef = useRef(null);

    const [mainImage, setMainImage] = useState(null);
    const [previewImages, setPreviewImages] = useState([]);

    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

    // Дані співрозмовника (ім'я + аватар)
    const [partnerName, setPartnerName] = useState('');
    const [partnerAvatar, setPartnerAvatar] = useState(null);

    // Заглушка повідомлень
    const [messages, setMessages] = useState([
        { id: 1, text: "To convey the spirit of retro...", senderId: 999, avatar: placeholderImg }
    ]);

    useEffect(() => {
        axios.get(`/commissions/${commissionId}`)
            .then(res => {
                if (res.data.success) {
                    const commData = res.data.commission;
                    setCommission(commData);
                    setStatus(commData.status || 'Sketch');

                    // --- ІНІЦІАЛІЗАЦІЯ ЗОБРАЖЕНЬ ---
                    if (commData.images && commData.images.length > 0) {
                        setMainImage(commData.images[0]);
                        // Всі інші зображення йдуть у прев'ю
                        setPreviewImages(commData.images.slice(1));
                    } else {
                        setMainImage(placeholderImg);
                        setPreviewImages([]);
                    }
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [commissionId]);

    // Коли відомий commission і user — завантажуємо профіль співрозмовника
    useEffect(() => {
        if (!commission || !user?.id) return;

        const currentUserId = Number(user.id);
        const creatorId = Number(commission.Creator_ID);
        const customerId = Number(commission.Customer_ID);

        // Обираємо ID співрозмовника: якщо я замовник — співрозмовник виконавець, і навпаки
        const partnerId = currentUserId === customerId ? creatorId : customerId;
        if (!partnerId) return;

        axios.get(`/artists/artist/${partnerId}`)
            .then((res) => {
                const artist = res.data;
                // Сервер нормалізує поля як name та avatar (imageBase64)
                setPartnerName(artist?.name || artist?.Name || 'User');
                setPartnerAvatar(artist?.avatar || artist?.imageBase64 || null);
            })
            .catch((err) => {
                console.error('Failed to load chat partner profile:', err);
            });
    }, [commission, user]);

    const handlePreviewClick = (clickedImage, clickedIndex) => {
        const currentMain = mainImage;
        const newPreviewImages = [...previewImages];

        // Міняємо місцями
        newPreviewImages[clickedIndex] = currentMain;

        setMainImage(clickedImage);
        setPreviewImages(newPreviewImages);
    };

    const openImageViewer = useCallback(() => {
        // Формуємо повний список для гортання: Головне + Прев'ю
        const allImages = [mainImage, ...previewImages].filter(img => img && img !== placeholderImg);

        // Індекс завжди 0, бо ми клікаємо по головному, яке перше у списку
        setViewerInitialIndex(0);

        if (allImages.length > 0) {
            setIsViewerOpen(true);
        }
    }, [mainImage, previewImages]);

    const closeImageViewer = useCallback(() => {
        setIsViewerOpen(false);
    }, []);

    if (loading) return <div className={styles.chatContainer}>Loading...</div>;
    if (!commission) return <div className={styles.chatContainer}>Commission not found</div>;

    // --- ПЕРЕВІРКА РОЛЕЙ ---
    // Приводимо до числа, щоб уникнути помилок типу "2" !== 2
    const currentUserId = Number(user.id);
    const creatorId = Number(commission.Creator_ID);
    const customerId = Number(commission.Customer_ID);

    const isCustomer = currentUserId === customerId;
    const isCreator = currentUserId === creatorId;

    console.log(`User: ${currentUserId}, Creator: ${creatorId}, IsCreator: ${isCreator}`);

    // --- ФУНКЦІОНАЛ ---
    const handleAddSketchClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setPendingStageImage(previewUrl);

            // Додаємо в чат для візуалізації
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: "",
                senderId: user.id,
                image: previewUrl,
                avatar: user.profileImage || placeholderImg
            }]);
        }
    };

    const handleApproveStage = () => {
        let nextStatus = status;
        if (status.toLowerCase() === 'sketch') nextStatus = 'Edits';
        else if (status.toLowerCase() === 'edits') nextStatus = 'Completed';
        else return;

        setStatus(nextStatus);
        setPendingStageImage(null);
        // Тут має бути запит на бекенд для оновлення статусу
    };

    const handleRejectStage = () => {
        alert("Stage rejected.");
    };

    const chatPartnerName = partnerName || (isCustomer ? "Creator" : "Customer");

    return (
        <div className={styles.chatContainer}>

            {/* ЛІВА КОЛОНКА */}
            <div className={styles.detailsColumn}>

                {/* 1. Блок з фото та описом */}
                <div className={styles.headerInfo}>
                    <div className={styles.imageWrapper}>
                        <img
                            src={mainImage}
                            alt="Commission"
                            className={styles.thumbImage}
                            onClick={openImageViewer} // Відкрити Viewer при кліку
                        />

                        {/* Рядок прев'ю, якщо є додаткові фото */}
                        {previewImages.length > 0 && (
                            <div className={styles.previewRow}>
                                {previewImages.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt={`preview ${index}`}
                                        className={styles.previewImg}
                                        onClick={() => handlePreviewClick(img, index)} // Swap при кліку
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.textInfo}>
                        {/* Заголовок Uppercase */}
                        <h4 className={styles.categoryTitle}>
                            {commission?.category || "FOREST EMBER RETREAT"}
                        </h4>

                        {/* Опис */}
                        <p className={styles.descriptionText}>
                            {commission?.description || "Create a cozy living room with a view of the forest..."}
                        </p>

                        {/* Ціна */}
                        <div className={styles.priceTag}>
                            {commission?.price || "45"}$
                        </div>
                    </div>
                </div>

                {/* 2. Статус бар (Sketch O O) */}
                <div className={styles.statusContainer}>
                    <div className={styles.statusHeader}>
                        <div className={styles.statusTitleBlock}>
                            <div className={styles.bigDot}></div>
                            <span className={styles.statusName}>{status}</span>
                        </div>

                        {/* Пусті круги праворуч */}
                        <div className={styles.dotsRow}>
                            {/* Просто декоративні круги, як на макеті */}
                            <div className={styles.hollowDot}></div>
                            <div className={styles.hollowDot}></div>
                        </div>
                    </div>

                    {/* 3. Основне поле (Рамка) */}
                    <div className={styles.stageBox}>
                        {/* Вміст stageBox (картинка, кнопки) залишається тим самим, що був у вас раніше */}
                        <div className={styles.imageArea}>
                            {pendingStageImage ? (
                                <img src={pendingStageImage} alt="Stage" className={styles.currentStageImage} />
                            ) : null}

                            {/* КНОПКИ ДЛЯ ЗАМОВНИКА (Customer) - ПОВЕРХ КАРТИНКИ */}
                            {isCustomer && pendingStageImage && status.toLowerCase() !== 'completed' && (
                                <div className={styles.actionsOverlay}>
                                    <button className={`${styles.actionBtn} ${styles.crossBtn}`} onClick={handleRejectStage}><CrossIcon /></button>
                                    <button className={`${styles.actionBtn} ${styles.checkBtn}`} onClick={handleApproveStage}><CheckIcon /></button>
                                </div>
                            )}
                        </div>

                        {/* КНОПКА ЗАВАНТАЖЕННЯ ДЛЯ ВИКОНАВЦЯ (Creator) - ВНИЗУ */}
                        {isCreator && status.toLowerCase() !== 'completed' && (
                            <>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{display: 'none'}}
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <div className={styles.addSketchBar} onClick={handleAddSketchClick}>
                                    Add Sketch
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ПРАВА КОЛОНКА (ЧАТ) */}
            <div className={styles.chatColumn}>
                <div className={styles.chatHeader}>
                    <div className={styles.headerUserName}>
                        {chatPartnerName}
                    </div>
                    <button className={styles.backButton} onClick={onBack}>✕</button>
                </div>

                <div className={styles.messagesList}>
                    {messages.map(msg => (
                        <div key={msg.id} className={`${styles.messageRow} ${msg.senderId === user.id ? styles.own : ''}`}>
                            {msg.senderId !== user.id && (
                                <img
                                    src={partnerAvatar || msg.avatar || placeholderImg}
                                    alt=""
                                    className={styles.userAvatar}
                                />
                            )}
                            <div className={styles.bubble}>
                                {msg.text && <div>{msg.text}</div>}
                                {msg.image && <img src={msg.image} alt="" className={styles.chatImageAttachment} />}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.inputArea}>
                    <div className={styles.inputWrapper}>
                        <input
                            type="text"
                            placeholder="Write message"
                            className={styles.chatInput}
                            /* Додайте обробку Enter, якщо потрібно */
                        />
                        {/* Іконка завантаження файлу */}
                        <div className={styles.inputIcon} onClick={handleAddSketchClick}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="white"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            {isViewerOpen && (
                <ImageViewer
                    images={[mainImage, ...previewImages].filter(img => img && img !== placeholderImg)}
                    initialImageIndex={viewerInitialIndex}
                    onClose={closeImageViewer}
                />
            )}
        </div>
    );
};

export default CommissionChat;