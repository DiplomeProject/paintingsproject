import React, { useState, useEffect } from 'react';
import {BrowserRouter} from 'react-router-dom';
import Nav from './components/Nav/Nav';
import AppRouter from "./AppRouter";
import Footer from "./components/Footer/Footer";
import { CartProvider } from './components/Cart/CartContext';
import axios from 'axios';
import ArtDetailsModal from "./components/ArtCard/Modals/ArtDetailsModal";

function App() {

    // 4. Додаємо сюди стан
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedArt, setSelectedArt] = useState(null);

    // Перевіряємо сесію при завантаженні App
    useEffect(() => {
        axios.get("http://localhost:8080/check-session", { withCredentials: true })
            .then(res => {
                console.log('Session check (App):', res.data.loggedIn);
                setIsLoggedIn(res.data.loggedIn);
            })
            .catch(() => {
                setIsLoggedIn(false);
            });
    }, []);

    const handleViewArtDetails = (art) => {
        setSelectedArt(art);
    };

    const handleCloseArtModal = () => {
        setSelectedArt(null);
    };

    return (
        <BrowserRouter>
            <CartProvider>
                <div className="App">
                    <Nav
                        isLoggedIn={isLoggedIn}
                        onViewArtDetails={handleViewArtDetails}
                    />

                    <AppRouter
                        onViewArtDetails={handleViewArtDetails}
                    />

                    <Footer/>
                </div>

                {selectedArt && (
                    <ArtDetailsModal
                        art={selectedArt}
                        onClose={handleCloseArtModal}
                        isLoggedIn={isLoggedIn}
                    />
                )}
            </CartProvider>
        </BrowserRouter>
    );
}

export default App;