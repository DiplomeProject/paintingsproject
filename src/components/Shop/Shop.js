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

const shopFilterConfig = [
    { title: "SORT BY", options: [{ name: "NONE" }, { name: "RATING" }, { name: "LATEST" }, { name: "EXPENSIVE" }, { name: "CHEAP" }]},
    { title: "STYLE", options: [{ name: "NONE STYLE", subOptions: [
        "Retro Futurism", "Mid-Century", "Modern, Art Deco", "Bauhaus, Y2K", "Aesthetic", "Memphis Style",
        "Grunge", "Psychedelic Art", "Surrealism, Neo-Psychedelia, Op Art", "Dreamcore", "Weirdcore",
        "Hyperrealism", "Social Realism", "Digital Realism", "Cinematic Realism", "Cyberpunk",
        "Synthwave", "Vaporwave", "Minimalism", "Brutalism", "Postmodern", "Collage."
    ] }]}
];

const categories = [
    "2D AVATARS", "3D MODELS", "BOOKS", "ANIME", "ICONS", "GAMES", "MOCKUPS", "UI/UX",
    "ADVERTISING", "BRENDING", "POSTER", "ARCHITECTURE", "FASHION", "SKETCH", "PHOTOGRAPHY"
];

const Shop = () => {
    const [cards, setCards] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [selectedArt, setSelectedArt] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const normalizeImage = (img) => {
        if (!img) return null;
        if (typeof img === 'string') {
            if (img.startsWith('data:') || img.startsWith('http')) return img;
            const cleaned = img.replace(/[\r\n\s]+/g, '');
            if (/^[A-Za-z0-9+/=]+$/.test(cleaned) && cleaned.length > 50) return `data:image/png;base64,${cleaned}`;
            return img;
        }
        if (typeof img === 'object' && Array.isArray(img.data)) {
            try {
                const bytes = Uint8Array.from(img.data);
                let binary = '';
                for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
                return `data:image/png;base64,${btoa(binary)}`;
            } catch (e) { return null; }
        }
        return null;
    };

    // check session
    useEffect(() => {
        axios.get("http://localhost:8080/check-session", { withCredentials: true })
            .then(res => setIsLoggedIn(!!res.data?.loggedIn))
            .catch(() => setIsLoggedIn(false));
    }, []);

    // fetch all paintings
    useEffect(() => {
    let mounted = true;
    axios.get("http://localhost:8080/api/paintings", { withCredentials: true })
        .then(res => {
            const payload = res.data;
            const list = Array.isArray(payload) ? payload : (payload.paintings || []);
            const mapped = (list || []).map(p => {
                // server may send width/height as lowercase or uppercase fields
                const width = p.width ?? p.Width ?? null;
                const height = p.height ?? p.Height ?? null;
                const imageSrc = p.imageUrl || p.Image || p.image || p.image_url || normalizeImage(p.Image);
                const images = [];
                if (p.images && Array.isArray(p.images)) {
                    p.images.forEach(it => {
                        const src = normalizeImage(it) || it;
                        if (src) images.push(src);
                    });
                } else if (imageSrc) {
                    images.push(imageSrc);
                }
                return {
                    id: p.Painting_ID || p.id || p.ID || Math.random().toString(36).slice(2,9),
                    title: p.Title || p.title || '',
                    artistName: p.author_name || p.creatorName || p.artistName || 'Artist',
                    description: p.Description || p.description || '',
                    imageUrl: imageSrc || '/images/placeholder.png',
                    images,
                    likes: p.likes || `${Math.floor(Math.random() * 500)}k`,
                    price: p.Price || p.price || (Math.random() * 200 + 20).toFixed(2),
                    category: categories.includes(p.Category) ? p.Category : (p.category || categories[0]),
                    style: p.Style || p.style || "Neo-minimalism",
                    fileFormat: p.Format || p.format || "PNG",
                    // expose width/height separately and keep size string
                    width: width,
                    height: height,
                    size: p.size || (width && height ? `${width} x ${height}` : (p.Size || p.size || ""))
                };
            });
            if (mounted) setCards(mapped);
        })
        .catch(err => {
            console.error('Failed to fetch paintings:', err);
            if (mounted) setCards([]);
        });
    return () => { mounted = false; };
}, []);



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
        if (activeCategory) filtered = filtered.filter(c => (c.category || '').toUpperCase() === activeCategory.toUpperCase());
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(c =>
                (c.title || '').toLowerCase().includes(q) ||
                (c.artistName || '').toLowerCase().includes(q) ||
                (c.style || '').toLowerCase().includes(q)
            );
        }
        return filtered;
    }, [cards, activeCategory, searchQuery]);

    const itemsPerPage = 96;
    const { currentPage, setCurrentPage, totalPages, displayedData: displayedCards } = usePagination(filteredCards, itemsPerPage);

    const handleCategoryClick = (category) => setActiveCategory(activeCategory === category ? null : category);

    // ✅ Fetch full batch images on card click
    const handleArtClick = async (art) => {
        try {
            const res = await axios.get(`http://localhost:8080/api/paintings/${art.id}`, { withCredentials: true });
            if (res.data.success) {
                const p = res.data.painting;
                const allImages = [];
                if (p.mainImage) allImages.push(p.mainImage);
                if (p.gallery && p.gallery.length) allImages.push(...p.gallery);

                setSelectedArt({
                    ...art,
                    images: allImages,
                    title: p.title,
                    artistName: p.author_name,
                    description: p.description,
                    price: p.price,
                    style: p.style
                });
            }
        } catch (err) {
            console.error("Failed to fetch painting batch:", err);
            setSelectedArt(art); // fallback
        }
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
                        </div>
                    </div>
                    {isLoggedIn && (
                        <button className={styles.addImageButton} onClick={() => setIsAddModalOpen(true)}>ADD IMAGE</button>
                    )}
                </header>

                <CategoryFilters categories={categories} activeCategory={activeCategory} onCategoryClick={handleCategoryClick} />
                {showAdvanced && <AdvancedFilters filterConfig={shopFilterConfig} />}

                {displayedCards.length ? (
                    <>
                        <div className={styles.artGridFull}>
                            {displayedCards.map(card => 
                                <ArtCard key={card.id} art={card} onArtClick={handleArtClick} />
                            )}
                        </div>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </>
                ) : (
                    <div className={styles.noResults}>There are no paintings available at the moment</div>
                )}
            </div>

            {selectedArt && <ArtDetailsModal art={selectedArt} onClose={() => setSelectedArt(null)} isLoggedIn={isLoggedIn} />}
            {isAddModalOpen && <AddArtModal onClose={() => setIsAddModalOpen(false)} categories={categories} filterConfig={shopFilterConfig} />}
        </div>
    );
};

export default Shop;
