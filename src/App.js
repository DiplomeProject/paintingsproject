import React, { useState, useEffect } from 'react';
import {BrowserRouter} from 'react-router-dom';
import Nav from './components/Nav/Nav';
import AppRouter from "./AppRouter";
import Footer from "./components/Footer/Footer";
import { CartProvider } from './components/Cart/CartContext';
import axios from 'axios';
import { ModalProvider } from './context/ModalContext';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        axios.get("http://localhost:8080/check-session", { withCredentials: true })
            .then(res => setIsLoggedIn(res.data.loggedIn))
            .catch(() => setIsLoggedIn(false));
    }, []);

    return (
        <BrowserRouter>
            <CartProvider>
                <ModalProvider isLoggedIn={isLoggedIn}>
                    <div className="App">
                        <Nav isLoggedIn={isLoggedIn} />
                        <AppRouter />
                        <Footer/>
                    </div>
                </ModalProvider>
            </CartProvider>
        </BrowserRouter>
    );
}

export default App;