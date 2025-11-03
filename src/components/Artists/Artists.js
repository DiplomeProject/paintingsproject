import React, { useState, useMemo, useEffect, useRef } from "react";
import styles from "./Artists.module.css";
import ArtCard from '../ArtCard/ArtCard';
import CategoryFilters from "../CategoryFilters/CategoryFilters";
import AdvancedFilters from '../AdvancedFilters/AdvancedFilters';

// --- Конфігурація фільтрів ---
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

// --- Функції для генерації рандомних даних ---
const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const mockTitles = [
    'Cyberpunk Alley', 'Forest Spirit', 'Oceanic Dread', 'Retro Future Car', 'Zen Garden 3D',
    'Project "Phoenix"', 'Synthwave Sunset', 'Minimalist Icon Set', 'Space Opera Concept',
    'Gothic Architecture', 'Vibrant Street Art', 'Abstract Emotions', 'Lunar Colony UI/UX',
    'Vintage Poster Ad', 'Nomad Sketch', 'EXHIBITION ADVERTISING'
];
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const mockNames = ["Andriy", "Oleksandra", "Max", "Yaroslav", "Danylo", "Sophia", "Ivan", "Olga", "Dmytro", "Viktoria"];
const mockSurnames = ["Kovalchuk", "Muratov", "Shevchenko", "Petrenko", "Franko", "Lysenko", "Kravchenko", "Bondarenko"];
const mockCountries = ["Ukraine", "Poland", "USA", "Italy", "Spain", "Germany", "France", "Japan"];
const mockStyles = ["Digital Art", "Fantasy", "Synthwave", "Minimalism", "Cyberpunk", "3D Render", "Photography", "Illustration"];

// Генерує 3-6 рандомних карток для одного артиста
const generateRandomArtworks = (artistName) => {
    return Array.from({ length: getRandomInt(3, 6) }, (_, i) => ({
        id: `p-${artistName.replace(/\s/g, '-')}-${i}`, // Унікальний ID
        title: getRandomElement(mockTitles),
        imageUrl: `/images/shopAndOtherPageImages/image${getRandomInt(1, 4)}.png`, // Використовуємо ваші 4 картинки
        artistName: artistName,
        artistStyle: getRandomElement(mockStyles),
        likes: getRandomInt(50, 500),
        price: getRandomInt(20, 250),
    }));
};

// Генерує одного рандомного артиста
const generateRandomArtist = (i) => {
    const name = `${getRandomElement(mockNames)} ${getRandomElement(mockSurnames)}`;
    const style = getRandomElement(mockStyles); // Стиль артиста

    return {
        id: i,
        name: name,
        country: getRandomElement(mockCountries),
        style: style,
        avatar: "/images/profileImg.jpg", // Використовуємо заглушку для аватара
        likesCount: getRandomInt(100, 5000), // Додано для "Likes"
        artworks: generateRandomArtworks(name), // Генерація робіт
    };
};

// Створюємо масив з 10 рандомних артистів
const artistsData = Array.from({ length: 10 }, (_, i) => generateRandomArtist(i));

// --- Головний компонент Artists ---

export default function Artists() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeCategory]);

    // Референси для скролу галерей кожного артиста
    const galleryRefs = useRef({});

    const scrollGallery = (artistId, direction) => {
        const gallery = galleryRefs.current[artistId];
        if (gallery) {
            const scrollAmount = 300; // Кількість пікселів для скролу
            if (direction === 'left') {
                gallery.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                gallery.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

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

                {/* --- Хедер --- */}
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
                                    <path d="M21 21l-4.35-4.35M10 18a8 8 0 1 1 0 -16 8 8 0 0 1 0 16z" strokeWidth="2" fill="none" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </header>

                {/* --- Фільтри --- */}
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

                {/* --- Список артистів (Оновлена розмітка для горизонтальних галерей) --- */}
                <div className={styles.artistsList}>
                    {filteredArtists.length > 0 ? (
                        filteredArtists.map(artist => (
                            <div key={artist.id} className={styles.artistSection}>

                                {/* Ліва частина: Аватар та інфо */}
                                <div className={styles.artistLeftInfo}>
                                    <img src={artist.avatar} alt={artist.name} className={styles.artistAvatar} />
                                    <h3 className={styles.artistName}>{artist.name}</h3>
                                    <div className={styles.artistDetails}>
                                        <span>Style: {artist.style}</span><br/>
                                        <span>Likes: {artist.likesCount}</span>
                                    </div>
                                </div>

                                {/* Права частина: Галерея робіт з навігацією */}
                                <div className={styles.artistRightGallery}>
                                    {/* Кнопка "Вліво" */}
                                        <button
                                            className={`${styles.navButton} ${styles.left}`}
                                            onClick={() => scrollGallery(artist.id, 'left')}
                                        >
                                            <img src="/assets/leftArrow.svg" alt="Scroll left" />
                                        </button>
                                    {/* Внутрішній контейнер для скролу */}
                                    <div
                                        className={styles.artistGalleryInner}
                                        ref={el => galleryRefs.current[artist.id] = el}
                                    >
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

                                    {/* Кнопка "Вправо" */}
                                    <button
                                        className={`${styles.navButton} ${styles.right}`}
                                        onClick={() => scrollGallery(artist.id, 'right')}
                                    >
                                        <img src="/assets/rightArrow.svg" alt="Scroll right" />
                                    </button>
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