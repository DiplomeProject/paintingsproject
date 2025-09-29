import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header/header';
import Nav from './Nav/Nav';
import AppRouter from "./AppRouter";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Nav />
        <AppRouter />
      </div>
    </BrowserRouter>
  );
}

export default App;