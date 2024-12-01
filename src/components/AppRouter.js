import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Profile from "./profilecompomemts/Profile";
import HomePage from "./HomePage";


export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='homepage' element={<HomePage />} />
                <Route path='profile' element={<Profile />} />
            </Routes>
        </BrowserRouter>
    )
}