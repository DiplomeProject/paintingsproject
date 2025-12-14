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

function MyImages({ user }) {
    const [paintings, setPaintings] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const itemsPerPage = 24;

    // Логіка завантаження перенесена сюди
    useEffect(() => {
        const fetchPaintings = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8080/api/profile/getuserpaintings",
                    { withCredentials: true }
                );
                if (response.data.success) {
                    setPaintings(response.data.paintings);
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
                                likes: painting.likes || 0,
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