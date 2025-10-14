import React, { useMemo, useState } from "react";
import styles from "./Shop.module.css";

const categories = [
    "2D AVATARS", "3D MODELS", "READING", "BRENDING",
    "ICONS", "GAMES", "MOCKUPS", "UI/UX",
    "advertising", "Brending", "poster", "Architecture",
    "Fashion", "Sketch", "Photography",
];

const Shop = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 20;

    const cards = useMemo(() => {
        return Array.from({ length: 63 }, (_, i) => ({
            id: i,
            imageUrl: `/images/image${(i % 5) + 1}.png`,
            title: `Artwork #${i + 1}`,
            artistName: "Digital Artist",
            artistStyle: "AI Art",
            likes: `${Math.floor(Math.random() * 500)}k`,
            price: (Math.random() * 200 + 20).toFixed(2),
        }));
    }, []);

    const totalPages = Math.ceil(cards.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const displayedCards = cards.slice(startIndex, startIndex + itemsPerPage);

    const renderPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 0; i < totalPages; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    className={`${styles.pageNumber} ${i === currentPage ? styles.active : ""}`}
                    onClick={() => setCurrentPage(i)}
                >
                    {i + 1}
                </button>
            );
        }
        return pageNumbers;
    };

    return (
        <div className={styles.shopPage}>
            <div className={styles.contentWrapper}>
                <header className={styles.header}>
                    <h1 className={styles.shopTitle}>Shop</h1>
                    <div className={styles.searchBarContainer}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search by title, artist, style..."
                        />
                        <button className={styles.searchButton}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                                <path d="M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" stroke="black" strokeWidth="2" fill="none" />
                            </svg>
                        </button>
                    </div>
                </header>

                <div className={styles.categoryGrid}>
                    {categories.map((cat) => (
                        <button key={cat} className={styles.categoryButton}>
                            {cat}
                        </button>
                    ))}
                </div>

                <div className={styles.artGridFull}>
                    {displayedCards.map((card) => (
                        <div key={card.id} className={styles.artCard}>
                            <div
                                className={styles.artCardImage}
                                style={{ backgroundImage: `url(${card.imageUrl})` }}
                            />
                            {/* --- ПОВЕРНУТО ВІДСУТНІЙ БЛОК --- */}
                            <div className={styles.artCardInfo}>
                                <div className={styles.cardRow}>
                                    <span className={styles.artCardTitle}>{card.title}</span>
                                    <span className={styles.artCardLikes}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                        {card.likes}
                                    </span>
                                </div>
                                <div className={styles.cardRow}>
                                    <div className={styles.artistInfo}>
                                        <span className={styles.artistName}>{card.artistName}</span>
                                        <span className={styles.artistStyle}>{card.artistStyle}</span>
                                    </div>
                                    <span className={styles.artCardPrice}>$ {card.price}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.paginationContainer}>
                    <div className={styles.pagination}>
                        <button
                            className={styles.pageBtn}
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                            disabled={currentPage === 0}
                        >
                            ‹
                        </button>
                        {renderPageNumbers()}
                        <button
                            className={styles.pageBtn}
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages - 1))}
                            disabled={currentPage === totalPages - 1}
                        >
                            ›
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;