import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (item) => {
        setCartItems((prevItems) => {
            const isItemInCart = prevItems.find((cartItem) => cartItem.id === item.id);

            if (isItemInCart) {
                alert("This item is already in your basket.");
                return prevItems;
            }

            // Якщо товару немає, додаємо його
            alert("Item added to basket!");
            return [...prevItems, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCartItems((prevItems) =>
            prevItems.filter((item) => item.id !== id)
        );
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};