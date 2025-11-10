import React, { useState, useMemo, useEffect, useRef } from "react";
import axios from 'axios';
import styles from "./Artists.module.css";
import ArtCard from '../ArtCard/ArtCard';
import CategoryFilters from "../CategoryFilters/CategoryFilters";
import AdvancedFilters from '../AdvancedFilters/AdvancedFilters';
import { usePagination } from '../hooks/Pagination/usePagination';
import Pagination from '../hooks/Pagination/Pagination';
import leftArrow from '../../assets/leftArrow.svg';
import rightArrow from '../../assets/rightArrow.svg';

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

export default function Artists() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [galleryStates, setGalleryStates] = useState({});
    const galleryRefs = useRef({});

    const checkGalleryOverflow = (artistId) => {
        const gallery = galleryRefs.current[artistId];
        if (gallery) {
            const hasOverflow = gallery.scrollWidth > gallery.clientWidth;
            setGalleryStates(prev => ({
                ...prev,
                [artistId]: {
                    hasOverflow,
                    showLeft: false,
                    showRight: hasOverflow
                }
            }));
        }
    };

    const [artistsData, setArtistsData] = useState([]);

    useEffect(() => {
        const fetchArtists = async () => {
            try {
                const res = await axios.get('http://localhost:8080/getartists', { withCredentials: true });
                const serverArtists = Array.isArray(res.data) ? res.data : (res.data.artists || []);
                const mapped = serverArtists.map((a, idx) => {
                    const name = a.Name || a.name || `Artist ${idx}`;
                    const artworks = Array.isArray(a.paintings)
                        ? a.paintings.map(p => ({
                            id: p.id || p.Painting_ID || p.PaintingId || `${idx}-${Math.random()}`,
                            title: p.title || p.Title || '',
                            // prefer normalized image_url produced by server, fallback to other fields
                            imageUrl: p.image_url || p.imageBase64 || p.Image || p.image || null,
                            artistName: name,
                            artistStyle: p.style || a.Style || a.style || '',
                            likes: p.likes || 0,
                            price: p.price || ''
                        }))
                        : [];
                    return {
                        id: a.Creator_ID || a.Creator_Id || a.id || idx,
                        name,
                        country: a.Country || a.country || 'Unknown',
                        style: a.Style || a.style || 'Unknown',
                        avatar: a.imageBase64 || a.profileImage || '/images/profileImg.jpg',
                        likesCount: a.likesCount || 0,
                        artworks
                    };
                });
                setArtistsData(mapped);
            } catch (err) {
                console.error('Error fetching artists from backend:', err);
                setArtistsData([]); // remove stubs/fallbacks — show real data only
            }
        };

        fetchArtists();
    }, []);

    const filteredArtists = useMemo(() => {
        let items = artistsData;
        if (activeCategory) {
            items = items.filter(a => (a.style || '').toUpperCase() === activeCategory.toUpperCase());
        }
        if (searchQuery) {
            items = items.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return items;
    }, [activeCategory, searchQuery, artistsData]);

    const itemsPerPage = 12;
    const {
        currentPage,
        setCurrentPage,
        totalPages,
        displayedData: displayedArtists
    } = usePagination(filteredArtists, itemsPerPage);

    useEffect(() => {
        const galleries = galleryRefs.current;
        const artistIds = Object.keys(galleries);
        artistIds.forEach(id => checkGalleryOverflow(id));
        const handleResize = () => artistIds.forEach(id => checkGalleryOverflow(id));
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [displayedArtists]);

    const handleGalleryScroll = (artistId) => {
        const gallery = galleryRefs.current[artistId];
        if (gallery) {
            const tolerance = 5;
            const atStart = gallery.scrollLeft <= tolerance;
            const atEnd = gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - tolerance;
            setGalleryStates(prev => ({
                ...prev,
                [artistId]: {
                    ...prev[artistId],
                    showLeft: !atStart,
                    showRight: !atEnd
                }
            }));
        }
    };

    const scrollGallery = (artistId, direction) => {
        const gallery = galleryRefs.current[artistId];
        if (gallery) {
            const cardWidth = 210;
            const gap = 20;
            const itemsToScroll = 6;
            const scrollAmount = (itemsToScroll * cardWidth) + (itemsToScroll * gap);
            gallery.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const handleCategoryClick = (category) => {
        setActiveCategory(prev => prev === category ? null : category);
        setCurrentPage(0);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(0);
    };

    return (
        <div className={styles.artistsPage}>
            <div className={styles.contentWrapper}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.artistsTitle}>Artists</h1>
                        <div className={styles.searchBarContainer}>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Search by artist name..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            <button className={styles.searchButton}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                                    <path d="M21 21l-4.35-4.35M10 18a8 8 0 1 1 0 -16 8 8 0 0 1 0 16z" strokeWidth="2" fill="none" />
                                </svg>
                            </button>
                        </div>
                    </div>
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
                {showAdvanced && <AdvancedFilters filterConfig={artistFilterConfig} />}

                <div className={styles.artistsList}>
                    {displayedArtists.length > 0 ? (
                        displayedArtists.map(artist => {
                            const state = galleryStates[artist.id] || { hasOverflow: false, showLeft: false, showRight: false };

                            return (
                                <div key={artist.id} className={styles.artistSection}>
                                    <div className={styles.artistLeftInfo}>
                                        <img src={artist.avatar} alt={artist.name} className={styles.artistAvatar} />
                                        <span className={styles.artistName}>{artist.name}</span>
                                        <div className={styles.artistDetails}>
                                            <span>Style: {artist.style}</span><br/>
                                            <span>Likes: {artist.likesCount}</span>
                                        </div>
                                    </div>

                                    <div className={styles.artistRightGallery}>
                                        {state.hasOverflow && state.showLeft && (
                                            <button
                                                className={`${styles.navButton} ${styles.left}`}
                                                onClick={() => scrollGallery(artist.id, 'left')}
                                            >
                                                <img src={leftArrow} alt="Scroll left" />
                                            </button>
                                        )}

                                        <div
                                            className={styles.artistGalleryInner}
                                            ref={el => galleryRefs.current[artist.id] = el}
                                            onScroll={() => handleGalleryScroll(artist.id)}
                                        >
                                            {artist.artworks && artist.artworks.length > 0 ? (
                                                artist.artworks.map(card => (
                                                    <ArtCard
                                                        key={card.id}
                                                        imageUrl={card.imageUrl}
                                                        title={card.title}
                                                        artistName={card.artistName}
                                                        artistStyle={card.artistStyle}
                                                        likes={card.likes}
                                                        price={card.price}
                                                    />
                                                ))
                                            ) : (
                                                <div className={styles.noArtworks}>No artworks available</div>
                                            )}
                                        </div>

                                        {state.hasOverflow && state.showRight && (
                                            <button
                                                className={`${styles.navButton} ${styles.right}`}
                                                onClick={() => scrollGallery(artist.id, 'right')}
                                            >
                                                <img src={rightArrow} alt="Scroll right" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className={styles.noResults}>No artists found</div>
                    )}
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}