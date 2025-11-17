import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Profile from "./components/profilecomponents/Profile/Profile";
import HomePage from "./components/HomePage/HomePage";
import Shop from "./components/Shop/Shop";
import Register from "./components/profilecomponents/Register/Register";
import Commission from "./components/Commission/Commission";
import Artists from "./components/Artists/Artists";
import CheckoutPage from './components/CheckoutPage/CheckoutPage';

export default function AppRouter({ onViewArtDetails }) {
    return (
        <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='homepage' element={<HomePage />} />
            <Route path='profile' element={<Profile />} />
            <Route path='register' element={<Register />} />
            <Route path='shop' element={<Shop />} />
            <Route path='artists' element={<Artists />} />
            <Route path='commission' element={<Commission />} />
            <Route
                path='checkout'
                element={<CheckoutPage onViewArtDetails={onViewArtDetails} />}
            />
        </Routes>
    )
}