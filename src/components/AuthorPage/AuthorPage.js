import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './AuthorPage.module.css';
import ArtCard from '../ArtCard/ArtCard';
import CategoryFilters from '../CategoryFilters/CategoryFilters';
import AdvancedFilters from '../AdvancedFilters/AdvancedFilters'; // Імпорт
import Pagination from '../hooks/Pagination/Pagination';
import { usePagination } from '../hooks/Pagination/usePagination';
import infoIcon from '../../assets/infoIcon.svg'
import globeIcon from '../../assets/icons/globeIcon.svg'
import heartIcon from '../../assets/icons/heartIcon.svg'
import AddCommissionModal from '../Commission/CommissionModals/AddCommissionModal';

// Конфіг
const additionalFilterConfig = [
    {
        title: "SORT BY",
        options: [
            { name: "LATEST" },
            { name: "POPULAR" },
            { name: "OLDEST" },
            { name: "PRICE: LOW TO HIGH" },
            { name: "PRICE: HIGH TO LOW" }
        ]
    }
];

const categories = ['ICONS', 'UI/UX', 'ADVERTISING', 'BRENDING'];

const AuthorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [artist, setArtist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(null);
    const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);

    useEffect(() => {
        const fetchArtist = async () => {
            try {
                const res = await axios.get(`/artists/artist/${id}`);
                setArtist(res.data);
            } catch (error) {
                console.error("Error loading artist:", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchArtist();
    }, [id]);

    const handleCommissionClick = () => {
        setIsCommissionModalOpen(true);
    };

    const handleCategoryClick = (category) => {
        setActiveCategory(prev => prev === category ? null : category);
    };

    const filteredPaintings = useMemo(() => {
        if (!artist || !artist.paintings) return [];
        let result = artist.paintings;
        if (activeCategory) {
            result = result.filter(p => (p.Style || '').toUpperCase().includes(activeCategory));
        }
        return result;
    }, [artist, activeCategory]);

    const itemsPerPage = 24;
    const {
        currentPage,
        setCurrentPage,
        totalPages,
        displayedData
    } = usePagination(filteredPaintings, itemsPerPage);

    useEffect(() => {
        setCurrentPage(0);
    }, [activeCategory, setCurrentPage]);

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (!artist) return <div className={styles.loading}>Artist not found</div>;

    const artistName = artist.Name || artist.name;
    const artistImage = artist.imageBase64 || artist.image || '/images/profileImg.jpg';
    const artistStyle = artist.Style || artist.style || 'Retro/Psychedelia';
    const artistCountry = artist.Country || 'En/Ukr';
    const artistBio = artist.Bio || artist.Description || "I create visual solutions that not only look good, but also work - helping businesses stand out and users enjoy the interaction.";
    const totalLikes = artist.likesCount || artist.paintings?.reduce((sum, p) => sum + (parseFloat(p.likes) || 0), 0) || "52.5k";

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>

                {/* --- ЛІВА ЧАСТИНА (САЙДБАР) --- */}
                <aside className={styles.sidebar}>
                    <div className={styles.avatarContainer}>
                        <img src={artistImage} alt={artistName} className={styles.avatar} />
                    </div>

                    <div>
                        <h1 className={styles.artistName}>
                            {artistName}
                            <span className={styles.status}>(available)</span>
                        </h1>
                    </div>

                    <div className={styles.metaInfo}>
                        <div className={styles.metaRow}>
                            <img src={infoIcon} alt="Style"/>
                            <span>{artistStyle}</span>
                        </div>
                        <div className={styles.metaRow}>
                            <img src={globeIcon} alt="Country"/>
                            <span>{artistCountry}</span>
                        </div>
                        <div className={styles.metaRow}>
                            <img src={heartIcon} alt="Likes"/>
                            <span>{typeof totalLikes === 'number' && totalLikes > 1000 ? (totalLikes/1000).toFixed(1) + 'k' : totalLikes}</span>
                        </div>
                    </div>

                    <p className={styles.bio}>
                        {artistBio}
                    </p>

                    <button className={styles.commissionBtn} onClick={handleCommissionClick}>
                        Commission
                    </button>
                </aside>

                {/* --- ПРАВА ЧАСТИНА (ГАЛЕРЕЯ) --- */}
                <main className={styles.gallerySection}>

                    {/* Верхні контроли */}
                    <div className={styles.topControls}>
                        <CategoryFilters
                            categories={categories}
                            activeCategory={activeCategory}
                            onCategoryClick={handleCategoryClick}
                        />

                        {/* Тепер AdvancedFilters самостійний */}
                        <AdvancedFilters filterConfig={additionalFilterConfig} />
                    </div>

                    {/* Сітка робіт */}
                    <div className={styles.artGrid}>
                        {displayedData.length > 0 ? (
                            displayedData.map(p => (
                                <ArtCard
                                    key={p.Painting_ID || p.id}
                                    art={{
                                        id: p.Painting_ID || p.id,
                                        title: p.Title || p.title,
                                        imageUrl: p.image_url || p.imageBase64 || p.Image,
                                        price: p.Price || p.price,
                                        artistName: artistName,
                                        likes: p.likes || 0,
                                        artistId: artist.Creator_ID || artist.Creator_Id || artist.CreatorId || artist.id || id,
                                        category: p.Category,
                                        style: p.Style
                                    }}
                                />
                            ))
                        ) : (
                            <div className={styles.noArt}>No artworks available.</div>
                        )}
                    </div>

                    {/* Пагінація */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </main>
            </div>

            {isCommissionModalOpen && (
                <AddCommissionModal
                    onClose={() => setIsCommissionModalOpen(false)}
                    targetCreatorId={artist.Creator_ID || artist.id}
                />
            )}

        </div>
    );
};

export default AuthorPage;