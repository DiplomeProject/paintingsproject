import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import styles from "./MyImages.module.css";
import ArtCard from "../../../../ArtCard/ArtCard";
import CategoryFilters from "../../../../CategoryFilters/CategoryFilters";
import AdvancedFilters from "../../../../AdvancedFilters/AdvancedFilters";
import Pagination from "../../../../hooks/Pagination/Pagination";
import { usePagination } from "../../../../hooks/Pagination/usePagination";

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

const profileCategories = ['ICONS', 'UI/UX', 'ADVERTISING', 'BRENDING'];

function MyImages({ user, onTotalLikesChange }) {
    const [paintings, setPaintings] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const itemsPerPage = 24;

    // Логіка завантаження перенесена сюди
    useEffect(() => {
        const fetchPaintings = async () => {
            try {
                const response = await axios.get(
                    "/profile/getuserpaintings"
                );
                if (response.data.success) {
                    const list = response.data.paintings || [];
                    setPaintings(list);
                    // Обновляем суммарные лайки сразу после загрузки
                    if (typeof onTotalLikesChange === 'function') {
                        const total = list.reduce((sum, p) => sum + (Number(p.likes ?? p.Likes) || 0), 0);
                        onTotalLikesChange(total);
                    }
                } else {
                    console.error("Failed to load paintings:", response.data.message);
                }
            } catch (err) {
                console.error("Error fetching paintings:", err);
            }
        };

        if (user) {
            fetchPaintings();
        }
    }, [user]);

    // Перераховуємо суму лайків при зміні локального списку картин
    useEffect(() => {
        if (typeof onTotalLikesChange === 'function') {
            const total = (paintings || []).reduce((sum, p) => sum + (Number(p.likes ?? p.Likes) || 0), 0);
            onTotalLikesChange(total);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paintings]);

    const handleCategoryClick = (category) => {
        if (activeCategory === category) {
            setActiveCategory(null);
        } else {
            setActiveCategory(category);
        }
        setCurrentPage(0);
    };

    const filteredPaintings = useMemo(() => {
        if (!activeCategory) {
            return paintings;
        }
        return paintings.filter(painting =>
            (painting.style || "").toUpperCase().includes(activeCategory.toUpperCase())
        );
    }, [paintings, activeCategory]);

    const {
        currentPage,
        setCurrentPage,
        totalPages,
        displayedData
    } = usePagination(filteredPaintings, itemsPerPage);

    useEffect(() => {
        setCurrentPage(0);
    }, [activeCategory, setCurrentPage]);

    return (
        <div className={styles.galleryContainer}>
            {/* Фільтри */}
            <div className={styles.topControls}>
                <CategoryFilters
                    categories={profileCategories}
                    activeCategory={activeCategory}
                    onCategoryClick={handleCategoryClick}
                />
                <AdvancedFilters filterConfig={additionalFilterConfig} />
            </div>

            {/* Сітка */}
            <div className={styles.artGrid}>
                {displayedData.length > 0 ? (
                    displayedData.map((painting) => (
                        <ArtCard
                            key={painting.id}
                            art={{
                                id: painting.id,
                                title: painting.title,
                                imageUrl: painting.image_url,
                                price: painting.price,
                                artistName: user.name,
                                likes: (painting.likes ?? painting.Likes ?? 0),
                                artistId: user.id,
                                category: painting.Category,
                                style: painting.style
                            }}
                        />
                    ))
                ) : (
                    <div className={styles.noArtworks}>You haven't uploaded any artworks yet.</div>
                )}
            </div>

            {/* Пагінація */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}

export default MyImages;