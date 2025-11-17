import React from 'react';
import styles from './CheckoutPage.module.css';
import { useCart } from '../Cart/CartContext'; // Переконайтеся, що шлях правильний
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
    // 1. Додаємо removeFromCart
    const { cartItems, removeFromCart } = useCart();
    const navigate = useNavigate();

    const subtotal = cartItems.reduce((acc, item) => {
        const price = parseFloat(item.price) || 0;
        return acc + price * item.quantity;
    }, 0).toFixed(2);

    const handlePay = (e) => {
        e.preventDefault();
        alert("Payment logic goes here!");
    };

    return (
        <div className={styles.checkoutPage}>
            <div className={styles.content}>

                {/* --- Ліва колонка (Товари) --- */}
                <div className={styles.itemsColumn}>
                    <h2 className={styles.title}>BASKET</h2>
                    <div className={styles.itemList}>
                        {cartItems.length === 0 ? (
                            <p className={styles.emptyMessage}>Your basket is empty. <span onClick={() => navigate('/shop')}>Go shopping.</span></p>
                        ) : (
                            // 2. Оновлюємо JSX для кожного item
                            cartItems.map((item) => (
                                <div className={styles.item} key={item.id}>
                                    <img src={item.imageUrl || "/images/placeholder.png"} alt={item.title} className={styles.itemImage} />
                                    <div className={styles.itemInfo}>
                                        {/* Обгортка для тексту */}
                                        <div className={styles.infoText}>
                                            <span className={styles.itemTitle}>{item.title}</span>
                                            <span className={styles.itemArtist}>{item.artistName}</span>
                                            <p className={styles.itemDesc}>{item.description.substring(0, 100)}...</p>
                                        </div>
                                        {/* Обгортка для кнопок */}
                                        <div className={styles.itemActions}>
                                            <span className={styles.itemPrice}>{item.price}$</span>
                                            <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}>
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
                </div>

                {/* --- Права колонка (Оплата) --- */}
                <div className={styles.paymentColumn}>
                    <form className={styles.paymentForm} onSubmit={handlePay}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">User's name</label>
                            <input type="text" id="name" required placeholder="Kira Kudo" />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" required placeholder="kudo.kira@gmail.com" />
                        </div>

                        <div className={styles.subtotal}>
                            <span>Subtotal</span>
                            <span>{subtotal}$</span>
                        </div>
                        <button
                            type="submit"
                            className={styles.payBtn}
                            disabled={cartItems.length === 0}
                        >
                            {/* 3. Оновлюємо текст кнопки */}
                            Pay with
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default CheckoutPage;