import { useNavigate } from "react-router-dom";
import { useState,React } from "react";
import "./Nav.css"



export function Navbar() {
    const [activeLink, setActiveLink] = useState("MAIN")
    const navigate = useNavigate();


    const handleNavigation = (path) => {
        navigate(path);
    };

  return (
        <nav className="navbar">
      <div className="navbar-top-border" />

      <div className="navbar-main">
        <div className="navbar-container">
          <div className="navbar-logo">
            <div className="logo-text">
              <div>Digital</div>
              <div>Brush</div>
            </div>
          </div>

          <div className="navbar-links">
            <button
              className={activeLink === "MAIN" ? "nav-button-active" : "nav-link"}
              onClick={() => {setActiveLink("MAIN");
                handleNavigation('/homepage');}}
            >
              MAIN
            </button>
            <button
              className={activeLink === "SHOP" ? "nav-button-active" : "nav-link"}
              onClick={() => {
                setActiveLink("SHOP");
                handleNavigation('/');
              }}
            >
              SHOP
            </button>
            <button
              className={activeLink === "ARTISTS" ? "nav-button-active" : "nav-link"}
              onClick={() => {
                setActiveLink("ARTISTS");
                handleNavigation('/');
              }}
            >
              ARTISTS
            </button>
            <button
              className={activeLink === "COMMISSION" ? "nav-button-active" : "nav-link"}
              onClick={() => {setActiveLink("COMMISSION");
                handleNavigation('/homepage');}}
            >
              COMMISSION
            </button>
          </div>

          <div className="navbar-right">
            <span className="nav-language">Eng</span>
            <button className="nav-signin-button" onClick={() => {
                setActiveLink("PROFILE");
                handleNavigation('/profile');
              }}>
              SIGN IN/
              <br />
              PROFILE
            </button>
          </div>
        </div>

        <div className="navbar-bottom-border" />
      </div>
    </nav>
  )
}

export default Navbar;