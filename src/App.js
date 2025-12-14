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
        axios.get('/auth/check-session')
            .then(res => setIsLoggedIn(res.data.loggedIn))
            .catch(() => setIsLoggedIn(false));
    }, []);

    return (
        <BrowserRouter>
            <CartProvider>
                <ModalProvider isLoggedIn={isLoggedIn}>
                    <div className="App">
                        <Nav isLoggedIn={isLoggedIn} />
                        <AppRouter
                            onViewArtDetails={() => {}} // (якщо у вас тут була функція)
                            setIsLoggedIn={setIsLoggedIn}
                        />
                        <Footer/>
                    </div>
                </ModalProvider>
            </CartProvider>
        </BrowserRouter>
    );
}

export default App;