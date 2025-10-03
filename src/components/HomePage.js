import React, { useState, useEffect } from 'react';
import "./HomePage.css";
import Gallery from '../Gallery/Gallery';
import AuthorPage from './AuthorPage/AuthorPage';
import PaintingDetailsModal from './PaintingsDetailsModal/PaintingsDetailsModal';

function HomePage() {
    const [paintings, setPaintings] = useState([]);
    const [selectedPainting, setSelectedPainting] = useState(null);
    const [showAuthorPage, setShowAuthorPage] = useState(false);
    const [authorData, setAuthorData] = useState(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        loadMainPage();

        // Добавляем обработчик скролла для навбара
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            setScrolled(isScrolled);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const loadMainPage = () => {
        setShowAuthorPage(false);
        fetch('http://localhost:8080/api/paintings')
            .then(response => response.json())
            .then(data => setPaintings(data))
            .catch(error => console.error('Error loading the paintings:', error));
    };

    const loadAuthorPage = (creatorId) => {
        fetch(`http://localhost:8080/api/creator/${creatorId}`)
            .then(response => response.json())
            .then(data => {
                setAuthorData(data);
                setShowAuthorPage(true);
            })
            .catch(error => console.error('Error loading the author page:', error));
    };

    const closeAuthorPage = () => {
        setShowAuthorPage(false);
        setAuthorData(null);
    };

    return (
        <div className="digital-brush">


            {/* Герой-секция */}
            <section id="home" className="hero">
                <div className="hero-content">
                    <div className="text-block">
                        <h1>Откройте мир цифрового искусства</h1>
                        <p>Исследуйте уникальные работы современных художников и найдите идеальное произведение для вашей коллекции</p>
                        <button className="register-btn">Начать探索</button>
                    </div>
                </div>
            </section>

            {/* Секция для покупателей */}
            <section className="buyer-section">
                <div className="buyer-content">
                    <h2>
                        Для ценителей
                        <span className="highlight">искусства</span>
                    </h2>
                    <p>Погрузитесь в мир цифрового творчества, где каждая работа рассказывает уникальную историю и вызывает неподдельные эмоции</p>
                    <button className="register-btn secondary">Узнать больше</button>
                </div>
            </section>

            {/* Секция трендов */}
            <section id="trends" className="trends">
                <div className="trends-header">
                    <h3>Популярные направления</h3>
                </div>
                <div className="trends-grid">
                    <div className="trend-card">
                        <div className="trend-image" style={{'--accent-color': '#667eea'}}></div>
                        <div className="trend-title">Абстракция</div>
                    </div>
                    <div className="trend-card">
                        <div className="trend-image" style={{'--accent-color': '#764ba2'}}></div>
                        <div className="trend-title">Портреты</div>
                    </div>
                    <div className="trend-card">
                        <div className="trend-image" style={{'--accent-color': '#f093fb'}}></div>
                        <div className="trend-title">Пейзажи</div>
                    </div>
                    <div className="trend-card">
                        <div className="trend-image" style={{'--accent-color': '#4facfe'}}></div>
                        <div className="trend-title">Сюрреализм</div>
                    </div>
                </div>
            </section>

            {/* Основной контент с галереей */}
            <div className="HomePage">
                {showAuthorPage ? (
                    <AuthorPage
                        authorData={authorData}
                        onSelectPainting={setSelectedPainting}
                        onClose={closeAuthorPage}
                    />
                ) : (
                    <Gallery
                        paintings={paintings}
                        onSelectPainting={setSelectedPainting}
                        onSelectAuthor={loadAuthorPage}
                    />
                )}

                {selectedPainting && (
                    <PaintingDetailsModal
                        painting={selectedPainting}
                        onClose={() => setSelectedPainting(null)}
                    />
                )}
            </div>
        </div>
    );
}

export default HomePage;