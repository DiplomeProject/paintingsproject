import React, { useEffect, useMemo, useState } from 'react';
import styles from './Commission.module.css';
import CategoryFilters from "../CategoryFilters/CategoryFilters";
import AdvancedFilters from '../AdvancedFilters/AdvancedFilters';
import Pagination from '../hooks/Pagination/Pagination';
import CommissionModalDetails from './CommissionModals/CommissionModalDetails';
import AddCommissionModal from './CommissionModals/AddCommissionModal';
import axios from 'axios';
import logo from '../../assets/logo.svg';

const commissionFilterConfig = [
{ title: "SORT BY", options: [{ name: "NONE" }, { name: "RATING" }, { name: "LATEST" }, { name: "EXPENSIVE" }, { name: "CHEAP" }]},
{ title: "STYLE", options: [{ name: "NONE STYLE", subOptions: ["Retro Futurism", "Mid-Century", "Cyberpunk", "Synthwave"]}]},
{ title: "FORMAT", options: [{ name: "NONE", subOptions: ["PNG", "JPG", "JPEG", "SVG"]}]}
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
const [currentPage, setCurrentPage] = useState(0);
const [totalPages, setTotalPages] = useState(0);

const [isLoggedIn, setIsLoggedIn] = useState(false);

useEffect(() => {
    axios.get("http://localhost:8080/check-session", { withCredentials: true })
        .then(res => setIsLoggedIn(res.data.loggedIn))
        .catch(() => setIsLoggedIn(false));
}, []);

useEffect(() => {
    const fetchCommissions = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:8080/api/commissions/public", {
                params: { page: currentPage + 1, limit: itemsPerPage },
                withCredentials: true
            });

            if (response.data.success && Array.isArray(response.data.commissions)) {
                const mapped = response.data.commissions.map(c => {
                    let imageSrc = c.imageUrl || c.Image || c.ReferenceImage || null;
                    if (imageSrc && typeof imageSrc === 'string') {
                        const s = imageSrc.trim();
                        if (!s.startsWith('data:')) {
                            const cleaned = s.replace(/(\r\n|\n|\r|\s)+/gm, "");
                            if (cleaned.length > 50 && /^[A-Za-z0-9+/=]+$/.test(cleaned)) {
                                imageSrc = `data:image/png;base64,${cleaned}`;
                            } else imageSrc = s;
                        }
                    } else imageSrc = null;

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

                setCommissions(mapped);
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

const displayedCommissions = useMemo(() => {
    let items = commissions;
    if (activeCategory) items = items.filter(c => (c.category || '').toUpperCase() === activeCategory.toUpperCase());
    if (searchQuery) items = items.filter(c => (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()));
    return items;
}, [activeCategory, searchQuery, commissions]);

useEffect(() => { document.body.style.overflow = isModalOpen || isAddModalOpen ? 'hidden' : 'auto'; }, [isModalOpen, isAddModalOpen]);

const handleCategoryClick = (category) => {
    setActiveCategory(activeCategory === category ? null : category);
    setCurrentPage(0);
};

const handleOpenModal = (commission) => { setSelectedCommission(commission); setIsModalOpen(true); };
const handleCloseModal = () => { setIsModalOpen(false); setSelectedCommission(null); };
const handleOpenAddModal = () => setIsAddModalOpen(true);
const handleCloseAddModal = () => setIsAddModalOpen(false);

// Callback for child modal to remove accepted commission
const handleAcceptCommission = (id) => {
    setCommissions(prev => prev.filter(c => c.id !== id));
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
                {isLoggedIn && <button className={styles.addCommissionButton} onClick={handleOpenAddModal}>ADD COMMISSION</button>}
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
                    </button>
                </div>
            </div>
            {showAdvanced && <AdvancedFilters filterConfig={commissionFilterConfig} />}

            {loading ? (
                <div className={styles.loadingSpinnerContainer}>
                    <img src={logo} alt="Loading" className={styles.loadingLogo} />
                </div>
            ) : (
                displayedCommissions.length > 0 ? (
                    <>
                        <div className={styles.commissionGrid}>
                            {displayedCommissions.map(commission => (
                                <div key={commission.id} className={styles.commissionCard}>
                                    <div className={styles.imagePriceWrapper}>
                                        <div className={styles.imageWrapper}>
                                            <img src={commission.imageSrc || "/images/placeholder.png"} alt={commission.title} className={styles.cardImage}/>
                                        </div>
                                        <div className={styles.priceOverlay}>
                                            <span className={styles.cardPrice}>${commission.price}</span>
                                        </div>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <h3 className={styles.cardTitle}>{commission.title}</h3>
                                        <p className={styles.cardDescription}>{commission.description}</p>
                                        <button className={styles.takeButton} onClick={() => handleOpenModal(commission)}>Take</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </>
                ) : <div className={styles.noResults}>There are no commissions available at the moment</div>
            )}
        </div>

        {isAddModalOpen && <AddCommissionModal onClose={handleCloseAddModal} />}
        {isModalOpen && selectedCommission && (
            <CommissionModalDetails
                commission={selectedCommission}
                onClose={handleCloseModal}
                onAccept={handleAcceptCommission} // pass callback
                variant="detailed"
            />
        )}
    </div>
);


}

export default Commission;
