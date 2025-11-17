import React, {useCallback, useEffect, useRef, useState} from 'react';
import styles from './BasketModal.module.css';
import { useCart } from '../../Cart/CartContext'; // Перевірте шлях до CartContext
import { useNavigate } from 'react-router-dom';
import closeIcon from '../../../assets/closeCross.svg';

const BasketModal = ({ onClose, onViewItemDetails, position}) => {
    const { cartItems, removeFromCart } = useCart();
    const navigate = useNavigate();
    const modalRef = useRef(null);

    const [isClosing, setIsClosing] = useState(false);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const subtotal = cartItems.reduce((acc, item) => {
        const price = parseFloat(item.price) || 0;
        return acc + price * item.quantity;
    }, 0).toFixed(2);

    const handleCheckout = () => {
        handleClose();
        navigate('/checkout');
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={`${styles.modal} ${isClosing ? styles.closing : ''}`}
                 ref={modalRef}
                 style={{
                     top: position ? `${position.top}px` : '15vh',
                     right: position ? `${position.right}px` : 'auto'
                 }}
            >
                <div className={styles.header}>
                    <h2>BASKET</h2>
                    <button className={styles.closeBtn} onClick={handleClose}>
                        <img src={closeIcon} alt="Close" />
                    </button>
                </div>

                <div className={styles.itemList}>
                    {cartItems.length === 0 ? (
                        <p className={styles.emptyMessage}>Your basket is empty.</p>
                    ) : (
                        cartItems.map((item) => (
                            <div className={styles.item}
                                 key={item.id}
                                 onClick={() => {
                                     onViewItemDetails(item);
                                 }}
                            >
                                <img src={item.imageUrl || "/images/placeholder.png"} alt={item.title} className={styles.itemImage} />

                                <div className={styles.itemInfo}>

                                    <div className={styles.infoText}>
                                        <span className={styles.itemTitle}>{item.title}</span>
                                        <span className={styles.itemArtist}>{item.artistName}</span>
                                        <p className={styles.itemDesc}>{item.description.substring(0, 100)}...</p>
                                    </div>

                                    <div className={styles.itemActions}>
                                        <span className={styles.itemPrice}>{item.price}$</span>
                                        <button className={styles.removeBtn} onClick={(e) => {
                                            e.stopPropagation();
                                            removeFromCart(item.id);
                                        }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3 6H5H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className={styles.footer}>
                    <div className={styles.subtotal}>
                        <span>Subtotal</span>
                        <span className={styles.price}>{subtotal}$</span>
                    </div>
                    <button
                        className={styles.buyBtn}
                        onClick={handleCheckout}
                        disabled={cartItems.length === 0}
                    >
                        Buy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BasketModal;