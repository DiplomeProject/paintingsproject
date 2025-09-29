import React, { useState } from 'react';
import './Nav.css';

function Nav() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <a className="navbar-brand" href="/homepage">
                    DIGITAL BRUSH
                </a>
                <button
                    className="navbar-toggler"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    ☰
                </button>
                <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
                    <ul className="navbar-links">
                        <li>
                            <a className="nav-link" href="/homepage">
                                Home
                            </a>
                        </li>
                        <li>
                            <a className="nav-link" href="/profile">
                                Profile
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Nav;
