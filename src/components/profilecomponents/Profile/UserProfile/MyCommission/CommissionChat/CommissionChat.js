import React, {useEffect, useState, useRef, useCallback} from 'react';
import axios from 'axios';
import styles from './CommissionChat.module.css';
import placeholderImg from '../../../../../../assets/image-placeholder-icon.svg';
import ImageViewer from "../../../../../ArtCard/ImageViewer/ImageViewer";
import { io } from 'socket.io-client';
// Іконки
const CheckIcon = () => (<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>);
const CrossIcon = () => (<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>);

const CommissionChat = ({ commissionId, user, onBack }) => {
    const [commission, setCommission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('Sketch');
    // Подача на ревью
    const [pendingStageImage, setPendingStageImage] = useState(null);
    const [pendingStageMessageId, setPendingStageMessageId] = useState(null);
    const [stageDecision, setStageDecision] = useState(null); // 'approve' | 'reject' | null
    const [submittingStage, setSubmittingStage] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(false);
    const fileInputRef = useRef(null); // для «Submit for review» (ліва колонка)
    const fileInputChatRef = useRef(null); // для картинки прямо в чат (скрепка)

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
    const [inputText, setInputText] = useState('');
    // автопрокрутка чата
    const messagesEndRef = useRef(null);
    const scrollToBottom = useCallback((smooth = true) => {
        try {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
            }
        } catch (e) {}
    }, []);

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

    // Load chat messages for this commission
    useEffect(() => {
        if (!commissionId) return;

        const mapServerMsg = (m) => {
            const isText = m.type === 'text';
            const isImage = m.type === 'image';
            // иногда backend может прислать dataURL либо в m.image, либо в m.content при type=image
            const imageData = isImage ? (m.image || m.content || null) : null;
            return {
                id: m.id,
                text: isText ? m.content : '',
                image: imageData,
                senderId: m.senderId,
                avatar: m.senderId === Number(user?.id)
                    ? (user?.profileImage || placeholderImg)
                    : (partnerAvatar || placeholderImg),
                timestamp: m.timestamp
            };
        };

        const loadMessages = async () => {
            try {
                const res = await axios.get(`/commissions/chat/${commissionId}/messages`);
                if (res.data && res.data.messages) {
                    const all = res.data.messages || [];
                    // CHAT: только text/image
                    const mapped = all.filter(m => m.type === 'text' || m.type === 'image').map(mapServerMsg);
                    setMessages(mapped);

                    // LEFT MENU: определить последнюю подачу `stage` и результат
                    const lastStage = [...all]
                        .filter(m => m.type === 'stage')
                        .sort((a,b)=> new Date(a.timestamp) - new Date(b.timestamp))
                        .pop();
                    if (lastStage) {
                        const lastId = lastStage.id;
                        const img = lastStage.image || lastStage.content || null;
                        setPendingStageImage(img || null);
                        setPendingStageMessageId(lastId);
                        // ищем самый поздний review для этого stage
                        const lastReview = [...all]
                            .filter(m => (m.type === 'stage-approve' || m.type === 'stage-reject') && String(m.content) === String(lastId))
                            .sort((a,b)=> new Date(a.timestamp) - new Date(b.timestamp))
                            .pop();
                        setStageDecision(lastReview ? (lastReview.type === 'stage-approve' ? 'approve' : 'reject') : null);
                    } else {
                        setPendingStageImage(null);
                        setPendingStageMessageId(null);
                        setStageDecision(null);
                    }
                }
            } catch (err) {
                console.error('Failed to load chat messages:', err);
            }
        };

        loadMessages();
        // realtime socket
        const serverBase = (process.env.REACT_APP_API_BASE || 'http://localhost:8080/api').replace(/\/api$/, '');
        const room = `commission_${commissionId}`;
        const socket = io(serverBase, { withCredentials: true, autoConnect: true, reconnection: true });

        // ensure we are always in the room after connects/reconnects
        const joinRoom = () => socket.emit('join', room);
        socket.on('connect', joinRoom);
        joinRoom();
        const handler = (msg) => {
            // ignore messages for other commissions
            if (String(msg.commissionId) !== String(commissionId)) return;
            // ignore echo of own messages to avoid race with local append
            const currentUid = Number(user?.id);
            if (Number(msg.senderId) === currentUid) return;

            const mapped = mapServerMsg(msg);
            setMessages(prev => {
                // avoid duplicate by id
                if (prev.some(m => String(m.id) === String(mapped.id))) return prev;
                return [...prev, mapped];
            });
            scrollToBottom();
        };
        socket.on('newMessage', handler);

        // «подача на ревью» от художника
        const onStageSubmitted = (payload) => {
            if (!payload || String(payload.commissionId) !== String(commissionId)) return;
            const m = payload.message || {};
            setPendingStageImage(m.image || m.content || null);
            setPendingStageMessageId(m.id);
            setStageDecision(null);
        };
        socket.on('stageSubmitted', onStageSubmitted);

        // результат ревью от заказчика
        const onStageReview = (payload) => {
            if (!payload || String(payload.commissionId) !== String(commissionId)) return;
            setStageDecision(payload.decision);
            if (payload.nextStatus) setStatus(payload.nextStatus);
        };
        socket.on('stageReview', onStageReview);

        return () => {
            socket.emit('leave', room);
            socket.off('newMessage', handler);
            socket.off('stageSubmitted', onStageSubmitted);
            socket.off('stageReview', onStageReview);
            socket.off('connect', joinRoom);
            socket.close();
        };
    }, [commissionId, user, partnerAvatar, scrollToBottom]);

    // автопрокрутка при изменении сообщений
    useEffect(() => {
        if (messages && messages.length) {
            // плавно только при добавлении небольшого количества
            scrollToBottom(true);
        }
    }, [messages, scrollToBottom]);

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

    // Отправка на ревью (ліва колонка)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Optional: limit file size (e.g., 5MB)
            const MAX_SIZE = 5 * 1024 * 1024;
            if (file.size > MAX_SIZE) {
                alert('File is too large. Max 5MB');
                return;
            }

            // read file as data URL and send to server as STAGE submission
            const reader = new FileReader();
            reader.onload = async () => {
                const dataUrl = reader.result;
                try {
                    setSubmittingStage(true);
                    const payload = { image: dataUrl };
                    const res = await axios.post(`/commissions/chat/${commissionId}/submit-stage`, payload);
                    if (res.data && res.data.success) {
                        const m = res.data.message || {};
                        setPendingStageImage(m.image || dataUrl);
                        setPendingStageMessageId(m.id);
                        setStageDecision(null);
                    } else {
                        console.error('Stage submit failed', res.data);
                        alert('Failed to submit for review');
                    }
                } catch (err) {
                    console.error('Error submitting stage:', err);
                    alert('Error submitting for review');
                } finally {
                    setSubmittingStage(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Загрузка картинки в сам чат (скрепка)
    const handleChatFileClick = () => {
        if (fileInputChatRef.current) fileInputChatRef.current.click();
    };

    const handleChatFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            alert('File is too large. Max 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = async () => {
            const dataUrl = reader.result;
            try {
                const res = await axios.post(`/commissions/chat/${commissionId}/messages`, { type: 'image', content: dataUrl });
                if (res.data && res.data.success) {
                    const m = res.data.message;
                    const mapped = {
                        id: m.id,
                        text: '',
                        image: m.image || dataUrl,
                        senderId: m.senderId,
                        avatar: user.profileImage || placeholderImg,
                        timestamp: m.timestamp
                    };
                    setMessages(prev => prev.some(x => String(x.id) === String(mapped.id)) ? prev : [...prev, mapped]);
                    scrollToBottom();
                } else {
                    alert('Failed to upload image');
                }
            } catch (err) {
                console.error('Chat image upload error:', err);
                alert('Error uploading image');
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text) return;

    // We only need to send the content; the backend finds the receiver
    const payload = {
        type: 'text',
        content: text
    };

    try {
            const res = await axios.post(`/commissions/chat/${commissionId}/messages`, payload);
        if (res.data && res.data.success) {
            const m = res.data.message;
            const mapped = {
                id: m.id,
                text: m.type === 'text' ? m.content : '',
                image: m.type === 'image' ? (m.image || m.content) : null,
                senderId: m.senderId,
                avatar: user.profileImage || placeholderImg,
                timestamp: m.timestamp
            };
            // Dedupe by id to avoid double-add when socket "echo" arrives first
            setMessages(prev =>
                prev.some(x => String(x.id) === String(mapped.id)) ? prev : [...prev, mapped]
            );
            setInputText('');
        }
    } catch (err) {
        console.error('Error sending message:', err);
    }
};

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleApproveStage = async () => {
        if (!pendingStageMessageId) return;
        try {
            setReviewLoading(true);
            const res = await axios.post(`/commissions/chat/${commissionId}/review`, { decision: 'approve', messageId: pendingStageMessageId });
            if (res.data && res.data.success) {
                setStageDecision('approve');
                if (res.data.nextStatus) setStatus(res.data.nextStatus);
            }
        } catch (e) {
            console.error('approve error', e);
        } finally {
            setReviewLoading(false);
        }
    };

    const handleRejectStage = async () => {
        if (!pendingStageMessageId) return;
        try {
            setReviewLoading(true);
            const res = await axios.post(`/commissions/chat/${commissionId}/review`, { decision: 'reject', messageId: pendingStageMessageId });
            if (res.data && res.data.success) {
                setStageDecision('reject');
            }
        } catch (e) {
            console.error('reject error', e);
        } finally {
            setReviewLoading(false);
        }
    };

    // src/.../CommissionChat.js

    const updateStatus = async (newStatus) => {
        try {
            // Замініть URL на ваш реальний шлях до API
            await axios.patch(`/commissions/${commissionId}/status`, { status: newStatus });

            // Оновлюємо локальний стейт
            setCommission(prev => ({ ...prev, Status: newStatus }));
            setStatus(newStatus); // Якщо у вас є окремий стейт для статусу
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Error updating status");
        }
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
                            {isCustomer && pendingStageImage && status.toLowerCase() !== 'completed' && stageDecision === null && (
                                <div className={styles.actionsOverlay}>
                                    <button className={`${styles.actionBtn} ${styles.crossBtn}`} onClick={handleRejectStage} disabled={reviewLoading} title={reviewLoading ? 'Processing...' : 'Reject'}>
                                        <CrossIcon />
                                    </button>
                                    <button className={`${styles.actionBtn} ${styles.checkBtn}`} onClick={handleApproveStage} disabled={reviewLoading} title={reviewLoading ? 'Processing...' : 'Approve'}>
                                        <CheckIcon />
                                    </button>
                                </div>
                            )}

                            {/* РЕЗУЛЬТАТ ДЛЯ ОБОИХ ПОЛЬЗОВАТЕЛЕЙ */}
                            {pendingStageImage && stageDecision && (
                                <div style={{position:'absolute', right: 8, bottom: 8, display:'flex', gap:8}}>
                                    {stageDecision === 'approve' && (
                                        <div className={styles.checkBtn} style={{width:32, height:32, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center'}}>
                                            <CheckIcon />
                                        </div>
                                    )}
                                    {stageDecision === 'reject' && (
                                        <div className={styles.crossBtn} style={{width:32, height:32, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center'}}>
                                            <CrossIcon />
                                        </div>
                                    )}
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
                                <div className={styles.addSketchBar} onClick={() => { if (!submittingStage) handleAddSketchClick(); }} style={submittingStage ? { opacity: 0.7, pointerEvents: 'none' } : undefined}>
                                    {submittingStage ? 'Uploading...' : 'Add Sketch'}
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
                            {/* Render bubble only if there's text or image */}
                            {(msg.text || msg.image) && (
                                <div className={styles.bubble}>
                                    {msg.text && <div>{msg.text}</div>}
                                    {msg.image && <img src={msg.image} alt="" className={styles.chatImageAttachment} />}
                                </div>
                            )}
                        </div>

                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className={styles.inputArea}>
                    <div className={styles.inputWrapper}>
                        <input
                            type="text"
                            placeholder="Write message"
                            className={styles.chatInput}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={handleInputKeyDown}
                        />
                        {/* Іконка завантаження файлу в чат */}
                        <div className={styles.inputIcon} onClick={handleChatFileClick}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="white"/>
                            </svg>
                        </div>
                        <input type="file" ref={fileInputChatRef} style={{display:'none'}} accept="image/*" onChange={handleChatFileChange} />
                        <button className={styles.sendButton} onClick={handleSendMessage}>Send</button>
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