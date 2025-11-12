import React, { useState, useMemo, useEffect } from 'react';
import styles from './Commission.module.css';
import CategoryFilters from "../CategoryFilters/CategoryFilters";
import AdvancedFilters from '../AdvancedFilters/AdvancedFilters';
// import { usePagination } from '../hooks/Pagination/usePagination';
import Pagination from '../hooks/Pagination/Pagination';
import CommissionModalDetails from './CommissionModals/CommissionModalDetails';
import AddCommissionModal from './CommissionModals/AddCommissionModal';
import axios from 'axios';

// ОНОВЛЕНО: Визначаємо конфігурацію фільтрів для Commission
const commissionFilterConfig = [
    { title: "SORT BY", options: [
            { name: "NONE" }, { name: "RATING" }, { name: "LATEST" }, { name: "EXPENSIVE" }, { name: "CHEAP" }
        ]},
    { title: "STYLE", options: [
            { name: "NONE STYLE", subOptions: [ "Retro Futurism", "Mid-Century", "Cyberpunk", "Synthwave" ]} // Скорочений список для прикладу
        ]},
    { title: "FORMAT", options: [
            { name: "NONE", subOptions: [ "PNG", "JPG", "JPEG", "SVG" ]} // Скорочений список для прикладу
        ]}
];

const categories = [
    "2D AVATARS", "3D MODELS", "BOOKS", "ANIME", "ICONS", "GAMES", "MOCKUPS", "UI/UX",
    "ADVERTISING", "BRENDING", "POSTER", "ARCHITECTURE", "FASHION", "SKETCH", "PHOTOGRAPHY"
];

/*// Функція для отримання випадкового цілого числа
const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Масиви з прикладами даних для рандомізації
const mockTitles = [
    'Cyberpunk Alley', 'Forest Spirit', 'Oceanic Dread', 'Retro Future Car', 'Zen Garden 3D',
    'Project "Phoenix"', 'Synthwave Sunset', 'Minimalist Icon Set', 'Space Opera Concept',
    'Gothic Architecture', 'Vibrant Street Art', 'Abstract Emotions', 'Lunar Colony UI/UX',
    'Vintage Poster Ad', 'Nomad Sketch', 'EXHIBITION ADVERTISING'
];

const mockDescriptions = [
    'To convey the spirit of retro - to combine the vintage aesthetics of the past with a modern visual language. Feelings: nostalgia, creativity, free spirit, experiment.',
    'A deep dive into neon-lit streets and future tech. Feelings: nostalgia, creativity, free spirit, experiment.',
    'Exploring the mystical connection between nature and magic. Feelings: nostalgia, creativity, free spirit, experiment.',
    'Modern UI/UX kit for a sleek and fast web application. Feelings: nostalgia, creativity, free spirit, experiment.',
    'Capturing the essence of the 80s with a modern twist. Feelings: nostalgia, creativity, free spirit, experiment.',
    'A 3D model designed for next-gen gaming engines. Feelings: nostalgia, creativity, free spirit, experiment.',
    'Hand-drawn sketches of fantastical creatures and lands. Feelings: nostalgia, creativity, free spirit, experiment.'
];
const mockAbout = [
    "This artwork was created with a deep sense of nostalgia, blending classic techniques with modern digital tools to evoke a feeling of a past that never was. Perfect for collectors who appreciate retro-futurism.",
    "A piece dedicated to the quiet moments of reflection. The use of color and light is intended to bring a sense of calm and introspection to any space.",
    "Inspired by the energy of the city at night, this commission is all about capturing the vibrant, chaotic beauty of urban life through a cyberpunk lens."
];
const mockStyles = ["Retro", "Cyberpunk", "Fantasy", "Minimalism", "3D Render"];
const mockFormats = ["PNG", "JPG", "Figma", "PSD", "AI"];
const mockSizes = ["1920x1080", "4000x4000", "A4 Print"];
const mockPreviewsSource = [
    "/images/shopAndOtherPageImages/image1.png",
    "/images/shopAndOtherPageImages/image2.png",
    "/images/shopAndOtherPageImages/image3.png",
];

const commissionsData = Array.from({ length: 1000 }, (_, i) => {
    const numPreviews = getRandomInt(1, 2);
    const generatedPreviews = Array.from(
        { length: numPreviews },
        () => getRandomElement(mockPreviewsSource)
    );

    return {
        id: i,
        image: `/images/shopAndOtherPageImages/image${getRandomInt(1, 4)}.png`,
        imageUrl: `/images/shopAndOtherPageImages/image${getRandomInt(1, 4)}.png`,
        title: getRandomElement(mockTitles),
        description: getRandomElement(mockDescriptions),
        price: getRandomInt(10, 250),
        category: categories[i % categories.length],
        style: getRandomElement(mockStyles),
        fileFormat: getRandomElement(mockFormats),
        size: getRandomElement(mockSizes),
        authorIcon: "/images/profileImg.jpg",
        about: getRandomElement(mockAbout),
        previews: generatedPreviews
    };
});*/

function Commission() {
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const itemsPerPage = 52;
    const [selectedCommission, setSelectedCommission] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // In Commission.js, update your commission card mapping section:

// В файлі Commission.js
    useEffect(() => {
        const fetchCommissions = async () => {
            setLoading(true);
            try {
                const response = await axios.get("http://localhost:8080/api/commissions/public", {
                    params: {
                        page: currentPage + 1,
                        limit: itemsPerPage
                    },
                    withCredentials: true
                });

                console.log('Fetched commissions:', response.data);

                if (response.data.success && Array.isArray(response.data.commissions)) {

                    // --- (ВИПРАВЛЕНО) ---
                    // Прибираємо непотрібний .map()
                    // Дані з сервера (response.data.commissions)
                    // ВЖЕ містять всі потрібні поля: Title, Description, Price, imageUrl і т.д.
                    setCommissions(response.data.commissions);
                    // --- (КІНЕЦЬ ВИПРАВЛЕННЯ) ---

                    setTotalPages(response.data.totalPages);
                } else {
                    setCommissions([]);
                    setTotalPages(0);
                }
            } catch (error) {
                console.error("Error fetching commissions:", error);
                setCommissions([]);
                setTotalPages(0);
            } finally {
                setLoading(false);
            }
        };
        fetchCommissions();
    }, [currentPage, itemsPerPage]);

    const filteredCommissions = useMemo(() => {
        let items = commissions; // 'commissions' - це ВЖЕ дані поточної сторінки
        if (activeCategory) {
            items = items.filter(c => (c.Category || '').toUpperCase() === activeCategory.toUpperCase());
        }
        if (searchQuery) {
            items = items.filter(c => (c.Title || '').toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return items;
    }, [activeCategory, searchQuery, commissions]);


    // const {
    //     currentPage,
    //     setCurrentPage,
    //     totalPages,
    //     displayedData: displayedCommissions
    // } = usePagination(filteredCommissions, itemsPerPage);

    const displayedCommissions = filteredCommissions;

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isModalOpen]);

    useEffect(() => {
        if (isAddModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isAddModalOpen]);

    const handleCategoryClick = (category) => {
        if (activeCategory === category) {
            setActiveCategory(null);
        } else {
            setActiveCategory(category);
        }
        setCurrentPage(0);
    };

    const handleOpenModal = (commission) => {
        setSelectedCommission(commission);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCommission(null);
    };

    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
    };

    if (loading) {
        return <div className={styles.loading}>Loading commissions...</div>;
    }

    return (
        <div className={styles.commissionPage}>
            <div className={styles.contentWrapper}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.commissionTitle}>COMMISSION</h1>
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
                    <button className={styles.addCommissionButton} onClick={handleOpenAddModal}>
                        <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.4158 0C5.56994 0 0 5.56994 0 12.4158C0 19.2617 5.56994 24.8317 12.4158 24.8317C19.2617 24.8317 24.8317 19.2617 24.8317 12.4158C24.8317 5.56994 19.2617 0 12.4158 0ZM12.4158 1.91013C18.2293 1.91013 22.9216 6.60236 22.9216 12.4158C22.9216 18.2293 18.2293 22.9216 12.4158 22.9216C6.60236 22.9216 1.91013 18.2293 1.91013 12.4158C1.91013 6.60236 6.60236 1.91013 12.4158 1.91013ZM11.4608 6.68545V11.4608H6.68545V13.3709H11.4608V18.1462H13.3709V13.3709H18.1462V11.4608H13.3709V6.68545H11.4608Z" fill="white"/>
                        </svg>
                        ADD COMMISSION
                    </button>
                </header>

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
                {showAdvanced && <AdvancedFilters filterConfig={commissionFilterConfig} />}
                {displayedCommissions.length > 0 ? (
                    <>
                        <div className={styles.commissionGrid}>
                            {displayedCommissions.map(commission => (
                                <div key={commission.id} className={styles.commissionCard}>
                                    <div className={styles.imagePriceWrapper}>
                                        <div className={styles.imageWrapper}>
                                            <img
                                                src={commission.imageUrl || "/images/placeholder.png"}

                                                alt={commission.Title || "Commission"}

                                                className={styles.cardImage}
                                                onError={(e) => {
                                                    if (!e.target.src.endsWith("/images/placeholder.png")) {
                                                        console.error('Image load error for:', commission.Title);
                                                        e.target.src = "/images/placeholder.png";
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className={styles.priceOverlay}>

                                            {/* --- ВИПРАВЛЕНО --- */}
                                            <span className={styles.cardPrice}>${commission.Price}</span>

                                        </div>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <div>

                                            {/* --- ВИПРАВЛЕНО --- */}
                                            <h3 className={styles.cardTitle}>{commission.Title}</h3>
                                            <p className={styles.cardDescription}>{commission.Description}</p>

                                        </div>
                                        <button
                                            className={styles.takeButton}
                                            onClick={() => handleOpenModal(commission)}
                                        >
                                            Take
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage} // setCurrentPage тепер тригерить useEffect
                        />
                    </>
                ) : (
                    <div className={styles.noResults}>There are no commissions available at the moment</div>
                )}
            </div>
            {isAddModalOpen && (
                <AddCommissionModal onClose={handleCloseAddModal} />
            )}

            {isModalOpen && (
                <CommissionModalDetails
                    commission={selectedCommission}
                    onClose={handleCloseModal}
                    variant="detailed"
                />
            )}
        </div>
    );
}

export default Commission;