import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import styles from "./DigitalBrushProfile.module.css";
import ArtCard from "../../../ArtCard/ArtCard";
import CategoryFilters from "../../../CategoryFilters/CategoryFilters";
import infoIcon from '../../../../assets/infoIcon.svg';
import globeIcon from '../../../../assets/icons/globeIcon.svg';
import heartIcon from '../../../../assets/icons/heartIcon.svg';
import AdvancedFilters from "../../../AdvancedFilters/AdvancedFilters";
import Pagination from "../../../hooks/Pagination/Pagination";
import {usePagination} from "../../../hooks/Pagination/usePagination";
import userIcon from "../../../../assets/icons/userIcon.svg";
import pictureIcon from "../../../../assets/icons/pictureIcon.svg";
import calendarIcon from "../../../../assets/icons/calendarIcon.svg";
import comissionIcon from "../../../../assets/icons/comissionIcon.svg";
import walletIcon from "../../../../assets/icons/walletIcon.svg";
import closeIcon from "../../../../assets/closeCross.svg";
import plusIcon from "../../../../assets/icons/plusIcon.svg";

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

function DigitalBrushProfile({ user, onLogout }) {
    const [paintings, setPaintings] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const itemsPerPage = 24;

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

    const totalLikes = "0";

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>

                {/* --- ЛІВА ЧАСТИНА (SIDEBAR) --- */}
                <aside className={styles.sidebar}>
                    <div className={styles.avatarContainer}>
                        <img
                            src={user.profileImage || "/images/profileImg.jpg"}
                            alt={user.name}
                            className={styles.avatar}
                        />
                    </div>

                    <div>
                        <h1 className={styles.artistName}>
                            {user.name || "Artist"}
                            <span className={styles.status}>(available)</span>
                        </h1>
                    </div>

                    <div className={styles.metaInfo}>
                        {/* Стиль (можна додати поле style в user, якщо нема - хардкод) */}
                        <div className={styles.metaRow}>
                            <img src={infoIcon} alt="Style" className={styles.socialicon} />
                            <span>Retro/Psychedelia</span>
                        </div>
                        {/* Країна/Мова */}
                        <div className={styles.metaRow}>
                            <img src={globeIcon} alt="Country" className={styles.socialicon} />
                            <span>En/Ukr</span>
                        </div>
                        {/* Лайки/Підписники */}
                        <div className={styles.metaRow}>
                            <img src={heartIcon} alt="Likes" className={styles.socialicon} />
                            <span>{totalLikes}</span>
                        </div>
                    </div>

                    <p className={styles.bio}>
                        {user.bio || "Welcome to my profile! No description provided yet."}
                    </p>

                    {/* Блок кнопок керування профілем */}
                    <div className={styles.actionButtonsContainer}>
                        <button className={styles.profileSettingsBtn}>
                            <img src={userIcon} alt="UserIcon" className={styles.btnicon} />
                            Settings profile
                        </button>
                        <button className={styles.imagesBtn}>
                            <img src={pictureIcon} alt="PictureIcon" className={styles.btnicon} />
                            My images
                            <img src={plusIcon} alt="PlusIcon" className={styles.plusIcon}/>
                        </button>
                        <button className={styles.comissionBtn}>
                            <img src={comissionIcon} alt="ComissionIcon" className={styles.btnicon} />
                            My Commission
                            <img src={plusIcon} alt="PlusIcon" className={styles.plusIcon}/>
                        </button>
                        <button className={styles.paymentBtn}>
                            <img src={walletIcon} alt="PaymentIcon" className={styles.btnicon} />
                            Payment
                        </button>
                        <button className={styles.calendarBtn}>
                            <img src={calendarIcon} alt="CalendarIcon" className={styles.btnicon} />
                            Calendar
                        </button>
                        <button className={styles.logoutBtn} onClick={onLogout}>
                            <img src={closeIcon} alt="CalendarIcon" className={styles.btnicon} />
                            Log out
                        </button>
                    </div>
                </aside>

                {/* --- ПРАВА ЧАСТИНА (GALLERY) --- */}
                <main className={styles.gallerySection}>

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
                </main>
            </div>

        </div>
    );
}

export default DigitalBrushProfile;