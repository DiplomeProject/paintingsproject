import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import styles from "./DigitalBrushProfile.module.css";
import ArtCard from "../../../ArtCard/ArtCard";
import CategoryFilters from "../../../CategoryFilters/CategoryFilters"; // Добавьте этот импорт
import infoICon from "../../../../assets/infoIcon.svg";
import infoICon1 from "../../../../assets/infoIcon1.svg";
import infoICon2 from "../../../../assets/infoIcon2.svg";

function DigitalBrushProfile({ user, onEditProfile, onLogout }) {
    const [paintings, setPaintings] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [activeCategory, setActiveCategory] = useState(null); // Добавьте состояние для активной категории
    const itemsPerPage = 24;

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageTitle, setImageTitle] = useState("");
    const [imageDescription, setImageDescription] = useState("");

    // Добавьте категории для профиля
    const profileCategories = [
        "ICONS", "UI/UX", "ADVERTISING", "BRANDING", "POSTER",
        "ARCHITECTURE", "FASHION", "SKETCH", "PHOTOGRAPHY"
    ];

    useEffect(() => {
        const fetchPaintings = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8080/getuserpaintings",
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

        fetchPaintings();
    }, []);

    const handleImageUpload = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("image", selectedImage);
        formData.append("title", imageTitle);
        formData.append("description", imageDescription);

        try {
            const response = await axios.post(
                "http://localhost:8080/upload",
                formData,
                { withCredentials: true }
            );
            if (response.data.success) {
                setShowUploadModal(false);
                setSelectedImage(null);
                setImageTitle("");
                setImageDescription("");
                // Refresh paintings after upload
                const paintingsResponse = await axios.get(
                    "http://localhost:8080/getuserpaintings",
                    { withCredentials: true }
                );
                if (paintingsResponse.data.success) {
                    setPaintings(paintingsResponse.data.paintings);
                }
            } else {
                console.error("Upload failed:", response.data.message);
            }
        } catch (err) {
            console.error("Error uploading image:", err);
        }
    };

    // Добавьте обработчик для категорий
    const handleCategoryClick = (category) => {
        if (activeCategory === category) {
            setActiveCategory(null);
        } else {
            setActiveCategory(category);
        }
    };

    // Фильтрация картин по категории
    const filteredPaintings = useMemo(() => {
        if (!activeCategory) {
            return paintings;
        }
        return paintings.filter(painting =>
            painting.category?.toUpperCase() === activeCategory.toUpperCase()
        );
    }, [paintings, activeCategory]);

    const totalPages = Math.ceil(filteredPaintings.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const displayedPaintings = useMemo(
        () => filteredPaintings.slice(startIndex, startIndex + itemsPerPage),
        [filteredPaintings, startIndex]
    );

    const renderPageNumbers = () => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => (
                <button
                    key={i}
                    className={i === currentPage ? styles.activePage : ""}
                    onClick={() => setCurrentPage(i)}
                >
                    {i + 1}
                </button>
            ));
        }

        const pages = [];
        pages.push(
            <button
                key={0}
                className={0 === currentPage ? styles.activePage : ""}
                onClick={() => setCurrentPage(0)}
            >
                1
            </button>
        );

        if (currentPage > 2) {
            pages.push(
                <span key="dots1" className={styles.paginationDots}>
                    ...
                </span>
            );
        }

        if (currentPage > 0 && currentPage < totalPages - 1) {
            pages.push(
                <button
                    key={currentPage}
                    className={styles.activePage}
                    onClick={() => setCurrentPage(currentPage)}
                >
                    {currentPage + 1}
                </button>
            );
        }

        if (currentPage < totalPages - 3) {
            pages.push(
                <span key="dots2" className={styles.paginationDots}>
                    ...
                </span>
            );
        }

        pages.push(
            <button
                key={totalPages - 1}
                className={totalPages - 1 === currentPage ? styles.activePage : ""}
                onClick={() => setCurrentPage(totalPages - 1)}
            >
                {totalPages}
            </button>
        );

        return pages;
    };

    return (
        <div className={styles.profileView}>
            <main className={styles.main}>
                <aside className={styles.profileSidebar}>
                    <div className={styles.profileCard}>
                        <div className={styles.avatarContainer}>
                            <img
                                src={user.profileImage || "/images/icons/profile.jpg"}
                                alt="Kira Kudo"
                                className={styles.avatar}
                            />
                        </div>

                        <div className={styles.nameStatusContainer}>
                            <h2 className={styles.name}>Kira Kudo <span className={styles.status}>(available)</span></h2>
                        </div>

                        <div className={styles.infoColumn}>
                            <span className={styles.infoItem}>
                                <img src={infoICon} className={styles.infoIcon} alt="Style icon" />
                                Retro/Psychedelia
                            </span>
                            <span className={styles.infoItem}>
                                <img src={infoICon1} className={styles.infoIcon} alt="Language icon" />
                                En/Укр
                            </span>
                            <span className={styles.infoItem}>
                                <img src={infoICon2} className={styles.infoIcon} alt="Followers icon" />
                                52.5k
                            </span>
                        </div>

                        <p className={styles.description}>
                            I create visual solutions that not only look good, but also work - helping businesses stand out and users enjoy the interaction.
                        </p>

                        <div className={styles.buttons}>
                            <button onClick={onEditProfile}>Settings profile</button>
                            <button onClick={() => setShowUploadModal(true)}>My images</button>
                            <button>My Commission</button>
                            <button>Payment</button>
                            <button>Calendar</button>
                            <button className={styles.logoutButton} onClick={onLogout}>
                                Log out
                            </button>
                        </div>
                    </div>
                </aside>

                {showUploadModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <div className={styles.modalHeader}>
                                <h5>Upload New Image</h5>
                                <button
                                    type="button"
                                    className={styles.closeButton}
                                    onClick={() => setShowUploadModal(false)}
                                >
                                    &times;
                                </button>
                            </div>
                            <div className={styles.modalBody}>
                                <form onSubmit={handleImageUpload}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="imageTitle">Title</label>
                                        <input
                                            type="text"
                                            id="imageTitle"
                                            value={imageTitle}
                                            onChange={(e) => setImageTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="imageDescription">Description</label>
                                        <textarea
                                            id="imageDescription"
                                            value={imageDescription}
                                            onChange={(e) => setImageDescription(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="imageUpload">Select Image</label>
                                        <input
                                            type="file"
                                            id="imageUpload"
                                            onChange={(e) => setSelectedImage(e.target.files[0])}
                                            accept="image/*"
                                            required
                                        />
                                    </div>
                                    <button type="submit" className={styles.saveButton}>
                                        Upload Image
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                <section className={styles.gallerySection}>
                    <div className={styles.filters}>
                        {/* Замените хардкод фильтров на компонент CategoryFilters */}
                        <CategoryFilters
                            categories={profileCategories}
                            activeCategory={activeCategory}
                            onCategoryClick={handleCategoryClick}
                        />
                        <div className={styles.additional}>ADDITIONAL FILTERS ▾</div>
                    </div>

                    <div className={styles.gallery}>
                        {displayedPaintings.length > 0 ? (
                            displayedPaintings.map((painting) => (
                                <ArtCard
                                    key={painting.id}
                                    imageUrl={painting.image_url}
                                    title={painting.title}
                                    artistName="Kira Kudo"
                                    artistStyle="Retro/Psychedelia"
                                    likes={painting.likes || 0}
                                    price={painting.price || ""}
                                />
                            ))
                        ) : (
                            <p>No artworks yet.</p>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                                disabled={currentPage === 0}
                            >
                                ‹
                            </button>
                            {renderPageNumbers()}
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages - 1))}
                                disabled={currentPage === totalPages - 1}
                            >
                                ›
                            </button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default DigitalBrushProfile;