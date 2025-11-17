import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import Nav from './components/Nav/Nav';
import AppRouter from "./AppRouter";
import Footer from "./components/Footer/Footer";
import { CartProvider } from './components/Cart/CartContext';

function App() {
    return (
        <BrowserRouter>
            <CartProvider>
                <div className="App">
                    <Nav/>
                    <AppRouter/>
                    <Footer/>
                </div>
            </CartProvider>
        </BrowserRouter>
    );
}

export default App;