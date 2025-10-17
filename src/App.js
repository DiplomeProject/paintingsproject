import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import Nav from './components/Nav/Nav';
import AppRouter from "./AppRouter";
import Footer from "./components/Footer/Footer";

function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <Nav/>
                <AppRouter/>
                <Footer/>
            </div>
        </BrowserRouter>
    );
}

export default App;