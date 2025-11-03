import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Profile from "./components/profilecomponents/Profile/Profile";
import HomePage from "./components/HomePage/HomePage";
import Shop from "./components/Shop/Shop";
import Register from "./components/profilecomponents/Register/Register";
import Artists from "./components/Artists/Artists";

export default function AppRouter() {
    return ( <
        Routes >
        <
        Route path = '/'
        element = { < HomePage / > }
        /> <
        Route path = 'homepage'
        element = { < HomePage / > }
        /> <
        Route path = 'profile'
        element = { < Profile / > }
        /> { /* Додаємо маршрут для реєстрації */ } <
        Route path = 'register'
        element = { < Register / > }
        /> <
        Route path = 'shop'
        element = { < Shop / > }
        /> <
        Route path = 'artists'
        element = { < Artists / > }
        /> { /* Поки що веде на HomePage */ } <
        Route path = 'commission'
        element = { < HomePage / > }
        /> <
        /Routes>
    )
}