import React from 'react';
import Header from './Header';
import Nav from './Nav';
import AppRouter from "./AppRouter";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
      <div className="App">
        <Header />
        <Nav />
        <AppRouter />
        <footer>
          <p>© 2024 Gallery. Всі права захищені.</p>
        </footer>
      </div>
  );
}

export default App;