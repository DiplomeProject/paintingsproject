import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Profile from "./components/profilecomponents/Profile/Profile";
import HomePage from "./components/HomePage";


export default function AppRouter() {
    return (
            <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='homepage' element={<HomePage />} />
                <Route path='profile' element={<Profile />} />ы
            </Routes>
    )
}