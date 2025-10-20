import React, { useState, useMemo, useEffect } from 'react';
import styles from './Commission.module.css';
import CategoryFilters from "../CategoryFilters/CategoryFilters";

const categories = [
    "2D AVATARS", "3D MODELS", "BOOKS", "ANIME", "ICONS", "GAMES", "MOCKUPS", "UI/UX",
    "ADVERTISING", "BRENDING", "POSTER", "ARCHITECTURE", "FASHION", "SKETCH", "PHOTOGRAPHY"
];

const commissionsData = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    imageUrl: `/images/image${(i % 5) + 1}.png`,
    title: 'EXHIBITION ADVERTISING',
    description: 'To convey the spirit of retro - to combine the vintage aesthetics of the past with a modern visual language.',
    feelings: ['nostalgia', 'creativity', 'free spirit', 'experiment'],
    price: 45,
    category: categories[i % categories.length]
}));

function Commission() {
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 12;

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    const filteredCommissions = useMemo(() => {
        let items = commissionsData;
        if (activeCategory) {
            items = items.filter(c => c.category.toUpperCase() === activeCategory.toUpperCase());
        }
        if (searchQuery) {
            items = items.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return items;
    }, [activeCategory, searchQuery]);

    const totalPages = Math.ceil(filteredCommissions.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const displayedCommissions = filteredCommissions.slice(startIndex, startIndex + itemsPerPage);

    const handleCategoryClick = (category) => {
        if (activeCategory === category) {
            setActiveCategory(null);
        } else {
            setActiveCategory(category);
        }
        setCurrentPage(0);
    };

    const renderPageNumbers = () => {
        if (totalPages <= 7) {
            const pageNumbers = [];
            for (let i = 0; i < totalPages; i++) {
                pageNumbers.push(
                    <button key={i} className={`${styles.pageNumber} ${i === currentPage ? styles.active : ""}`} onClick={() => setCurrentPage(i)}>
                        {i + 1}
                    </button>
                );
            }
            return pageNumbers;
        }
        const pages = [];
        const siblingCount = 1;
        pages.push(<button key={0} className={`${styles.pageNumber} ${0 === currentPage ? styles.active : ""}`} onClick={() => setCurrentPage(0)}>1</button>);
        if (currentPage > siblingCount + 1) {
            pages.push(<span key="dots1" className={styles.paginationDots}>...</span>);
        }
        const startPage = Math.max(1, currentPage - siblingCount);
        const endPage = Math.min(totalPages - 2, currentPage + siblingCount);
        for (let i = startPage; i <= endPage; i++) {
            pages.push(<button key={i} className={`${styles.pageNumber} ${i === currentPage ? styles.active : ""}`} onClick={() => setCurrentPage(i)}>{i + 1}</button>);
        }
        if (currentPage < totalPages - siblingCount - 2) {
            pages.push(<span key="dots2" className={styles.paginationDots}>...</span>);
        }
        if (totalPages > 1) {
            pages.push(<button key={totalPages - 1} className={`${styles.pageNumber} ${totalPages - 1 === currentPage ? styles.active : ""}`} onClick={() => setCurrentPage(totalPages - 1)}>{totalPages}</button>);
        }
        return pages;
    };

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
                    <button className={styles.addCommissionButton}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                            <line x1="12" y1="8" x2="12" y2="16" stroke="white" strokeWidth="2"/>
                            <line x1="8" y1="12" x2="16" y2="12" stroke="white" strokeWidth="2"/>
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
                    <button className={styles.additionalFilters}>
                        ADDITIONAL FILTERS ▾
                    </button>
                </div>

                {displayedCommissions.length > 0 ? (
                    <>
                        <div className={styles.commissionGrid}>
                            {displayedCommissions.map(commission => (
                                <div key={commission.id} className={styles.commissionCard}>
                                    <img src={commission.imageUrl} alt={commission.title} className={styles.cardImage} />
                                    <div className={styles.cardContent}>
                                        <h3 className={styles.cardTitle}>{commission.title}</h3>
                                        <p className={styles.cardDescription}>{commission.description}</p>
                                        <div className={styles.cardTags}>
                                            <strong>Feelings:</strong> {commission.feelings.join(', ')}
                                        </div>
                                        <div className={styles.cardFooter}>
                                            <span className={styles.cardPrice}>{commission.price}$</span>
                                            <button className={styles.takeButton}>Take</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.paginationContainer}>
                            <div className={styles.pagination}>
                                <button
                                    className={styles.pageBtn}
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 0))}
                                    disabled={currentPage === 0}
                                >
                                    ‹
                                </button>
                                {renderPageNumbers()}
                                <button
                                    className={styles.pageBtn}
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages - 1))}
                                    disabled={currentPage === totalPages - 1 || totalPages === 0}
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className={styles.noResults}>There are no commissions available at the moment</div>
                )}
            </div>
        </div>
    );
}

export default Commission;