import React, { useState, useMemo, useEffect } from 'react';
import styles from './Commission.module.css';
import CategoryFilters from "../CategoryFilters/CategoryFilters";

const categories = [
    "2D AVATARS", "3D MODELS", "BOOKS", "ANIME", "ICONS", "GAMES", "MOCKUPS", "UI/UX",
    "ADVERTISING", "BRENDING", "POSTER", "ARCHITECTURE", "FASHION", "SKETCH", "PHOTOGRAPHY"
];

const commissionsData = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    imageUrl: `/images/shopAndOtherPageImages/image${(i % 4) + 1}.png`,
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
                        <button className={styles.additionalFilters}>
                            ADDITIONAL FILTERS
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="white" strokeWidth="2"/>
                            </svg>
                        </button>
                    </div>
                </div>

                {displayedCommissions.length > 0 ? (
                    <>
                        <div className={styles.commissionGrid}>
                            {displayedCommissions.map(commission => (
                                <div key={commission.id} className={styles.commissionCard}>
                                    <div className={styles.imagePriceWrapper}>
                                        <div className={styles.imageWrapper}>
                                            <img src={commission.imageUrl} alt={commission.title} className={styles.cardImage} />
                                        </div>
                                        <div className={styles.priceOverlay}>
                                            <span className={styles.cardPrice}>{commission.price}$</span>
                                        </div>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <h3 className={styles.cardTitle}>{commission.title}</h3>
                                        <p className={styles.cardDescription}>{commission.description}</p>
                                        <p className={styles.cardTags}>Feelings: {commission.feelings.join(', ')}</p>
                                        <button className={styles.takeButton}>Take</button>
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