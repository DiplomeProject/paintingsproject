import React, { useMemo, useState, useEffect } from "react";
import styles from "./Shop.module.css";
import ArtCard from '../ArtCard/ArtCard';
import CategoryFilters from "../CategoryFilters/CategoryFilters";
import AdvancedFilters from '../AdvancedFilters/AdvancedFilters';
import { usePagination } from '../hooks/Pagination/usePagination';
import Pagination from '../hooks/Pagination/Pagination';
import ArtDetailsModal from "../ArtCard/Modals/ArtDetailsModal";
import axios from 'axios';
import AddArtModal from "./AddArtModal/AddArtModal";

// ОНОВЛЕНО: Визначаємо конфігурацію фільтрів для Shop
const shopFilterConfig = [
    { title: "SORT BY", options: [
            { name: "NONE" }, { name: "RATING" }, { name: "LATEST" }, { name: "EXPENSIVE" }, { name: "CHEAP" }
        ]},
    { title: "STYLE", options: [
            { name: "NONE STYLE", subOptions: [
                    "Retro Futurism", "Mid-Century", "Modern, Art Deco", "Bauhaus, Y2K", "Aesthetic", "Memphis Style",
                    "Grunge", "Psychedelic Art", "Surrealism, Neo-Psychedelia, Op Art", "Dreamcore", "Weirdcore",
                    "Hyperrealism", "Social Realism", "Digital Realism", "Cinematic Realism", "Cyberpunk",
                    "Synthwave", "Vaporwave", "Minimalism", "Brutalism", "Postmodern", "Collage."
                ]}
        ]},
    { title: "FORMAT", options: [
            { name: "NONE", subOptions: [
                    "PNG", "JPG", "JPEG", "SVG", "AI", "PSD", "PDF", "EPS", "FIG", "XD", "SKETCH",
                    "CLIP", "SAI", "ICO", "TIFF", "RAW", "DNG", "DWG", "SKP", "3DS", "MAX", "FBX",
                    "OBJ", "GLB", "STL", "UNITYPACKAGE", "UNREALPROJECT"
                ]}
        ]},
    { title: "SIZE", options: [
            { name: "NONE" }, { name: "BIG" }, { name: "MIDDLE" }, { name: "SMALL" }
        ]},
    { title: "COLOR", options: [
            { name: "NONE" }, { name: "COLOR" }
        ]}
];

const categories = [
    "2D AVATARS", "3D MODELS", "BOOKS", "ANIME", "ICONS", "GAMES", "MOCKUPS", "UI/UX",
    "ADVERTISING", "BRENDING", "POSTER", "ARCHITECTURE", "FASHION", "SKETCH", "PHOTOGRAPHY"
];

const Shop = () => {

    const cards = useMemo(() => {
        return Array.from({ length: 400 }, (_, i) => ({
            id: i,
            imageUrl: `/images/shopAndOtherPageImages/image${(i % 4) + 1}.png`,
            images: [ // Масив зображень для модалки
                `/images/shopAndOtherPageImages/image${(i % 4) + 1}.png`,
                `/images/shopAndOtherPageImages/image${((i + 1) % 4) + 1}.png`,
                '/images/shopAndOtherPageImages/shepard.jpg',
            ],
            title: `Artwork #${i + 1}`,
            artistName: "Digital Artist",
            artistStyle: categories[i % categories.length], // 'categories' доступна тут
            likes: `${Math.floor(Math.random() * 500)}k`,
            price: (Math.random() * 200 + 20).toFixed(2),
            category: categories[i % categories.length],

            // --- Поля, яких раніше не було ---
            style: "Neo-minimalism",
            fileFormat: "PNG",
            size: "1080 x 1920",
            description: "The composition features two large, metallic, ring-like sculptures with reflective chrome surfaces, symmetrically placed on a stark white background."
        }));
    }, []);

    const [activeCategory, setActiveCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [selectedArt, setSelectedArt] = useState(null);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        axios.get("http://localhost:8080/check-session", { withCredentials: true })
            .then(res => {
                console.log('Session check (Shop):', res.data.loggedIn);
                setIsLoggedIn(res.data.loggedIn);
            })
            .catch(() => {
                setIsLoggedIn(false);
            });
    }, []);

    const filteredCards = useMemo(() => {
        let filtered = cards;

        if (activeCategory) {
            filtered = filtered.filter(card => card.category.toUpperCase() === activeCategory.toUpperCase());
        }

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(card =>
                card.title.toLowerCase().includes(lowercasedQuery) ||
                card.artistName.toLowerCase().includes(lowercasedQuery) ||
                card.artistStyle.toLowerCase().includes(lowercasedQuery)
            );
        }

        return filtered;
    }, [activeCategory, cards, searchQuery]);

    const itemsPerPage = 96; // Визначаємо, скільки елементів на сторінці
    const {
        currentPage,
        setCurrentPage,
        totalPages,
        displayedData: displayedCards // Перейменовуємо displayedData на displayedCards
    } = usePagination(filteredCards, itemsPerPage);

    const handleCategoryClick = (category) => {
        if (activeCategory === category) {
            setActiveCategory(null);
        } else {
            setActiveCategory(category);
        }
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    return (
        <div className={styles.shopPage}>
            <div className={styles.contentWrapper}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.shopTitle}>SHOP</h1>
                        <div className={styles.searchBarContainer}>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Title of the art..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className={styles.searchButton}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                                    <path d="M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" stroke="black" strokeWidth="2" fill="none" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    {isLoggedIn && (
                        <button className={styles.addImageButton} onClick={() => setIsAddModalOpen(true)}>
                            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.4158 0C5.56994 0 0 5.56994 0 12.4158C0 19.2617 5.56994 24.8317 12.4158 24.8317C19.2617 24.8317 24.8317 19.2617 24.8317 12.4158C24.8317 5.56994 19.2617 0 12.4158 0ZM12.4158 1.91013C18.2293 1.91013 22.9216 6.60236 22.9216 12.4158C22.9216 18.2293 18.2293 22.9216 12.4158 22.9216C6.60236 22.9216 1.91013 18.2293 1.91013 12.4158C1.91013 6.60236 6.60236 1.91013 12.4158 1.91013ZM11.4608 6.68545V11.4608H6.68545V13.3709H11.4608V18.1462H13.3709V13.3709H18.1462V11.4608H13.3709V6.68545H11.4608Z" fill="white"/>
                            </svg>
                            ADD IMAGE
                        </button>
                    )}
                </header>

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
                {showAdvanced && <AdvancedFilters filterConfig={shopFilterConfig} />}
                {displayedCards.length > 0 ? (
                    <>
                        <div className={styles.artGridFull}>
                            {displayedCards.map((card) => (
                                <ArtCard
                                    key={card.id}
                                    art={card}
                                    onArtClick={setSelectedArt}
                                />
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                ) : (
                    <div className={styles.noResults}>
                        There are no paintings available at the moment
                    </div>
                )}
            </div>
            {selectedArt && (
                <ArtDetailsModal
                    art={selectedArt}
                    onClose={() => setSelectedArt(null)}
                    isLoggedIn={isLoggedIn}
                />
            )}

            {isAddModalOpen && (
                <AddArtModal
                    onClose={() => setIsAddModalOpen(false)}
                    categories={categories}
                    filterConfig={shopFilterConfig}
                />
            )}
        </div>
    );
};

export default Shop;