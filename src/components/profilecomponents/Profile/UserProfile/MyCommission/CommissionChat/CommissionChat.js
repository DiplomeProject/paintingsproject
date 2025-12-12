import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import styles from './CommissionChat.module.css';
import placeholderImg from '../../../../../../assets/image-placeholder-icon.svg';

// Іконки
const CheckIcon = () => (<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>);
const CrossIcon = () => (<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>);

const CommissionChat = ({ commissionId, user, onBack }) => {
    const [commission, setCommission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('Sketch');
    const [pendingStageImage, setPendingStageImage] = useState(null);
    const fileInputRef = useRef(null);

    // Заглушка повідомлень
    const [messages, setMessages] = useState([
        { id: 1, text: "To convey the spirit of retro...", senderId: 999, avatar: placeholderImg }
    ]);

    useEffect(() => {
        axios.get(`http://localhost:8080/api/commissions/${commissionId}`, { withCredentials: true })
            .then(res => {
                if (res.data.success) {
                    setCommission(res.data.commission);
                    // Тепер бекенд повертає статус, беремо його
                    setStatus(res.data.commission.status || 'Sketch');
                    console.log("Commission Data Loaded:", res.data.commission);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [commissionId]);

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

    const chatPartnerName = isCustomer ? "Creator Name" : "Customer Name";

    return (
        <div className={styles.chatContainer}>

            {/* ЛІВА КОЛОНКА */}
            <div className={styles.detailsColumn}>

                <div className={styles.headerInfo}>
                    <img src={commission.images?.[0] || placeholderImg} alt="" className={styles.thumbImage} />
                    <div className={styles.textInfo}>
                        <h4 className={styles.categoryTitle}>{commission.category || "CATEGORY"}</h4>
                        <p className={styles.descriptionText}>{commission.description}</p>
                        <div className={styles.priceTag}>{commission.price}$</div>
                    </div>
                </div>

                <div className={styles.statusContainer}>
                    <div className={styles.statusHeader}>
                        <div className={styles.statusTitleBlock}>
                            <div className={styles.bigDot}></div>
                            {status}
                        </div>
                        <div className={styles.dotsRow}>
                            {[1, 2].map(i => <div key={i} className={styles.hollowDot}></div>)}
                        </div>
                    </div>

                    <div className={styles.stageBox}>
                        <div className={styles.imageArea}>
                            {pendingStageImage ? (
                                <img src={pendingStageImage} alt="Stage" className={styles.currentStageImage} />
                            ) : (
                                // Якщо картинки немає, нічого не показуємо або плейсхолдер
                                null
                            )}

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
                    <div className={styles.headerUserName}>{chatPartnerName}</div>
                    <button className={styles.backButton} onClick={onBack}>✕</button>
                </div>

                <div className={styles.messagesList}>
                    {messages.map(msg => (
                        <div key={msg.id} className={`${styles.messageRow} ${msg.senderId === user.id ? styles.own : ''}`}>
                            {msg.senderId !== user.id && <img src={msg.avatar || placeholderImg} alt="" className={styles.userAvatar} />}
                            <div className={styles.bubble}>
                                {msg.text && <div>{msg.text}</div>}
                                {msg.image && <img src={msg.image} alt="" className={styles.chatImageAttachment} />}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.inputArea}>
                    <div className={styles.inputWrapper}>
                        <input type="text" placeholder="Write message" className={styles.chatInput} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommissionChat;