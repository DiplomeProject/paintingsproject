import React, { useState, useMemo, useEffect } from 'react';
import styles from './Commission.module.css';
import CategoryFilters from "../CategoryFilters/CategoryFilters";
import AdvancedFilters from '../AdvancedFilters/AdvancedFilters';
import { usePagination } from '../hooks/Pagination/usePagination';
import Pagination from '../hooks/Pagination/Pagination';
import CommissionModalDetails from './CommissionModals/CommissionModalDetails';
import AddCommissionModal from './CommissionModals/AddCommissionModal';
import axios from 'axios';

// ... (Filter configurations remain the same)

const commissionFilterConfig = [
    { title: "SORT BY", options: [
        { name: "NONE" }, { name: "RATING" }, { name: "LATEST" }, { name: "EXPENSIVE" }, { name: "CHEAP" }
    ]},
    { title: "STYLE", options: [
        { name: "NONE STYLE", subOptions: [ "Retro Futurism", "Mid-Century", "Cyberpunk", "Synthwave" ]}
    ]},
    { title: "FORMAT", options: [
        { name: "NONE", subOptions: [ "PNG", "JPG", "JPEG", "SVG" ]}
    ]}
];

const categories = [
    "2D AVATARS", "3D MODELS", "BOOKS", "ANIME", "ICONS", "GAMES", "MOCKUPS", "UI/UX",
    "ADVERTISING", "BRENDING", "POSTER", "ARCHITECTURE", "FASHION", "SKETCH", "PHOTOGRAPHY"
];


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

    useEffect(() => {
        const fetchCommissions = async () => {
            setLoading(true);
            try {
                const response = await axios.get("http://localhost:8080/api/commissions/public", {
                    withCredentials: true
                });

                console.log('Fetched commissions:', response.data);

                if (response.data.success && Array.isArray(response.data.commissions)) {
                    const mapped = response.data.commissions.map(c => {
                        // prefer server-normalized imageUrl
                        let imageSrc = c.imageUrl || c.Image || c.ReferenceImage || null;

                        if (imageSrc && typeof imageSrc === 'string') {
                            const s = imageSrc.trim();
                            if (s.startsWith('data:')) {
                                imageSrc = s;
                            } else {
                                // remove newlines/spaces that may break base64
                                const cleaned = s.replace(/(\r\n|\n|\r|\s)+/gm, "");
                                if (cleaned.length > 50 && /^[A-Za-z0-9+/=]+$/.test(cleaned)) {
                                    // treat as raw base64 -> prefix as PNG
                                    imageSrc = `data:image/png;base64,${cleaned}`;
                                } else {
                                    // keep as-is (might be a public URL or filesystem path); browser will try to load it
                                    imageSrc = s;
                                }
                            }
                        } else {
                            imageSrc = null;
                        }

                        return {
                            id: c.Commission_ID || c.id,
                            title: c.Title || '',
                            description: c.Description || '',
                            price: c.Price || 0,
                            category: c.Category || '',
                            style: c.Style || '',
                            fileFormat: c.Format || '',
                            size: c.Size || '',
                            imageUrl: c.imageUrl || null,
                            imageSrc: imageSrc || "/images/placeholder.png",
                            about: c.Description || '',
                            authorIcon: "/images/profileImg.jpg",
                        };
                    });

                    console.log('Mapped commissions (with imageSrc):', mapped.map(m => ({ id: m.id, imageSrcType: typeof m.imageSrc, imageSrcPreview: (m.imageSrc || '').slice(0,60) })));
                    setCommissions(mapped);
                } else {
                    setCommissions([]);
                }
            } catch (error) {
                console.error("Error fetching commissions:", error);
                setCommissions([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCommissions();
    }, []);

    const filteredCommissions = useMemo(() => {
    let items = commissions;
    if (activeCategory) {
        items = items.filter(c => (c.category || '').toUpperCase() === activeCategory.toUpperCase());
    }
    if (searchQuery) {
        items = items.filter(c => (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return items;
    }, [activeCategory, searchQuery, commissions]);


    const {
        currentPage,
        setCurrentPage,
        totalPages,
        displayedData: displayedCommissions
    } = usePagination(filteredCommissions, itemsPerPage);

    // Effect for Modal
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

    // Effect for AddModal
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
                                                src={commission.imageSrc || "/images/placeholder.png"}
                                                alt={commission.title || "Commission"}
                                                className={styles.cardImage}
                                                onError={(e) => {
                                                    console.error('Image load error for:', commission.title, 'Source:', commission.imageSrc);
                                                    e.target.src = "/images/placeholder.png";
                                                }}
                                            />
                                        </div>
                                        <div className={styles.priceOverlay}>
                                            <span className={styles.cardPrice}>${commission.price}</span>
                                        </div>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <div>
                                            <h3 className={styles.cardTitle}>{commission.title}</h3>
                                            <p className={styles.cardDescription}>{commission.description}</p>
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
                            onPageChange={setCurrentPage}
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