import React, { useState, useMemo, useEffect } from "react";
import styles from "./Artists.module.css"; // 1. Перехід на CSS Modules
import ArtCard from '../ArtCard/ArtCard'; // 2. Використовуємо ArtCard
import CategoryFilters from "../CategoryFilters/CategoryFilters";
import AdvancedFilters from '../AdvancedFilters/AdvancedFilters';

// --- Конфігурація фільтрів (подібно до Shop) ---
const categories = [
    "2D AVATARS", "3D MODELS", "BOOKS", "ANIME", "ICONS", "GAMES",
    "MOCKUPS", "UI/UX", "ADVERTISING", "BRENDING", "POSTER",
    "ARCHITECTURE", "FASHION", "SKETCH", "PHOTOGRAPHY"
];

const artistFilterConfig = [
    { title: "SORT BY", options: [
            { name: "NONE" }, { name: "NAME (A-Z)" }, { name: "NAME (Z-A)" }, { name: "LATEST" }
        ]},
    { title: "COUNTRY", options: [
            { name: "NONE" }, { name: "Ukraine" }, { name: "Poland" }, { name: "USA" }, { name: "Italy" }, { name: "Spain" }
        ]}
];

// --- Функції для генерації рандомних даних (як у Shop.js) ---
const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const mockNames = ["Andriy", "Oleksandra", "Max", "Yaroslav", "Danylo", "Sophia", "Ivan"];
const mockSurnames = ["Kovalchuk", "Muratov", "Shevchenko", "Petrenko", "Franko"];
const mockCountries = ["Ukraine", "Poland", "USA", "Italy", "Spain", "Germany"];
const mockTitles = ['Cyberpunk Alley', 'Forest Spirit', 'Oceanic Dread', 'Retro Future Car', 'Zen Garden 3D'];

// Генерує 3-6 рандомних карток для одного артиста
const generateRandomArtworks = (artistName, artistStyle) => {
    return Array.from({ length: getRandomInt(3, 6) }, (_, i) => ({
        id: `p-${artistName}-${i}`,
        title: getRandomElement(mockTitles),
        imageUrl: `/images/shopAndOtherPageImages/image${getRandomInt(1, 4)}.png`,
        artistName: artistName,
        artistStyle: artistStyle,
        likes: getRandomInt(50, 500),
        price: getRandomInt(20, 250),
    }));
};

// Генерує одного рандомного артиста
const generateRandomArtist = (i) => {
    const name = `${getRandomElement(mockNames)} ${getRandomElement(mockSurnames)}`;
    const style = getRandomElement(categories);

    return {
        id: i,
        name: name,
        country: getRandomElement(mockCountries),
        style: style,
        avatar: "/images/profileImg.jpg", // Використовуємо заглушку
        artworks: generateRandomArtworks(name, style),
    };
};

// Створюємо масив з 10 рандомних артистів
const artistsData = Array.from({ length: 10 }, (_, i) => generateRandomArtist(i));

// --- Головний компонент ---

export default function Artists() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeCategory]);

    const filteredArtists = useMemo(() => {
        let items = artistsData;
        if (activeCategory) {
            items = items.filter(a => a.style.toUpperCase() === activeCategory.toUpperCase());
        }
        if (searchQuery) {
            items = items.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return items;
    }, [activeCategory, searchQuery]);

    const handleCategoryClick = (category) => {
        if (activeCategory === category) {
            setActiveCategory(null);
        } else {
            setActiveCategory(category);
        }
    };

    return (
        <div className={styles.artistsPage}>
            <div className={styles.contentWrapper}>

                {/* --- Хедер (як у Shop/Commission) --- */}
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.artistsTitle}>Artists</h1>
                        <div className={styles.searchBarContainer}>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Search by artist name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className={styles.searchButton}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                                    <path d="M21 21l-4.35-4.35M10 18a8 8 0 1 1 0 -16 8 8 0 0 1 0 16z" stroke="black" strokeWidth="2" fill="none" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </header>

                {/* --- Фільтри (як у Shop/Commission) --- */}
                <div className={styles.filtersWrapper}>
                    <CategoryFilters
                        categories={categories}
                        activeCategory={activeCategory}
                        onCategoryClick={handleCategoryClick}
                    />
                    <div className={styles.filtersContainer}>
                        <button
                            className={`${styles.additionalFilters} ${showAdvanced ? styles.active : ''}`}
                            onClick={() => setShowAdvanced(!showAdvanced)}
                        >
                            ADDITIONAL FILTERS
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="white" strokeWidth="2"/>
                            </svg>
                        </button>
                    </div>
                </div>
                {showAdvanced && <AdvancedFilters filterConfig={artistFilterConfig} />}

                {/* --- Список артистів (Оновлена розмітка) --- */}
                <div className={styles.artistsList}>
                    {filteredArtists.length > 0 ? (
                        filteredArtists.map(artist => (
                            <div key={artist.id} className={styles.artistSection}>

                                {/* Інфо про артиста */}
                                <div className={styles.artistInfoRow}>
                                    <img src={artist.avatar} alt={artist.name} className={styles.artistAvatar} />
                                    <div className={styles.artistMeta}>
                                        <h3 className={styles.artistName}>{artist.name}</h3>
                                        <div className={styles.artistDetails}>
                                            {artist.style} | {artist.country}
                                        </div>
                                    </div>
                                </div>

                                <h4 className={styles.artistGalleryTitle}>Artworks</h4>

                                {/* Галерея робіт артиста */}
                                <div className={styles.artistGallery}>
                                    {artist.artworks.map(card => (
                                        <ArtCard
                                            key={card.id}
                                            imageUrl={card.imageUrl}
                                            title={card.title}
                                            artistName={card.artistName}
                                            artistStyle={card.artistStyle}
                                            likes={card.likes}
                                            price={card.price}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.noResults}>No artists found</div>
                    )}
                </div>
            </div>
        </div>
    );
}