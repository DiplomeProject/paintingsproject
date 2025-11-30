import React, { useState, useEffect } from 'react';
import styles from './MyCommission.module.css';
import CategoryFilters from "../../../../CategoryFilters/CategoryFilters"; // Імпорт як у MyImages

// Масив категорій для фільтрації
const commissionFilters = ['MY ORDERS', 'MY TASKS'];

// Дані-заглушки
const DUMMY_DB_DATA = [
    {
        Commission_ID: 101,
        Title: "Retro Poster Design",
        Description: "Need a vintage style poster for an exhibition.",
        Price: 45,
        ReferenceImage: "/images/placeholder.png",
        Status: "Sketch",
        Customer_ID: 2,
        Creator_ID: 55
    },
    {
        Commission_ID: 102,
        Title: "Cyberpunk Character",
        Description: "Full body character art in cyberpunk style.",
        Price: 120,
        ReferenceImage: "/images/placeholder.png",
        Status: "Completed",
        Customer_ID: 99,
        Creator_ID: 2
    },
    {
        Commission_ID: 103,
        Title: "Logo for Coffee Shop",
        Description: "Minimalist logo design.",
        Price: 30,
        ReferenceImage: "/images/placeholder.png",
        Status: "Search",
        Customer_ID: 2,
        Creator_ID: null
    },
    {
        Commission_ID: 104,
        Title: "Album Cover",
        Description: "Abstract art for music album.",
        Price: 80,
        ReferenceImage: "/images/placeholder.png",
        Status: "Edits",
        Customer_ID: 77,
        Creator_ID: 2
    }
];

function MyCommission({ user }) {
    const currentUserId = user?.id || 1;

    // За замовчуванням активна перша категорія
    const [activeFilter, setActiveFilter] = useState('MY ORDERS');
    const [commissions, setCommissions] = useState([]);

    useEffect(() => {
        setCommissions(DUMMY_DB_DATA);
    }, []);

    // Логіка кліку по категорії (працює як перемикач вкладок)
    const handleFilterClick = (category) => {
        // Якщо потрібно, щоб можна було "вимкнути" фільтр і показати пустий екран - додайте перевірку на null,
        // але для логіки Orders/Tasks краще завжди тримати одну активною.
        setActiveFilter(category);
    };

    // Логіка фільтрації
    const displayedCommissions = commissions.filter(item => {
        if (activeFilter === 'MY ORDERS') {
            return item.Customer_ID === currentUserId;
        } else if (activeFilter === 'MY TASKS') {
            return item.Creator_ID === currentUserId;
        }
        return false;
    });

    const getFilledDotsCount = (status) => {
        switch (status?.toLowerCase()) {
            case 'sketch': return 1;
            case 'edits': return 2;
            case 'completed': return 3;
            case 'search': return 0;
            default: return 0;
        }
    };

    const renderDots = (status) => {
        const filledCount = getFilledDotsCount(status);
        const dots = [];
        for (let i = 0; i < 3; i++) {
            const isPurple = i < 2;
            dots.push(
                <div
                    key={i}
                    className={`${styles.dot} ${i < filledCount ? styles.filled : ''} ${isPurple ? styles.purple : ''}`}
                ></div>
            );
        }
        return <div className={styles.dotsContainer}>{dots}</div>;
    };

    return (
        <div className={styles.container}>
            {/* Використання спільного компонента CategoryFilters */}
            <div className={styles.filtersWrapper}>
                <CategoryFilters
                    categories={commissionFilters}
                    activeCategory={activeFilter}
                    onCategoryClick={handleFilterClick}
                />
            </div>

            {/* Контент */}
            {displayedCommissions.length > 0 ? (
                <div className={styles.commissionGrid}>
                    {displayedCommissions.map((item) => (
                        <div key={item.Commission_ID} className={styles.commissionCard}>

                            <div className={styles.imagePriceWrapper}>
                                <div className={styles.imageWrapper}>
                                    <img
                                        src={item.ReferenceImage || "/images/placeholder.png"}
                                        alt={item.Title}
                                        className={styles.cardImage}
                                        onError={(e) => { e.target.src = "/images/placeholder.png"; }}
                                    />
                                </div>
                                <div className={styles.priceOverlay}>
                                    <span className={styles.cardPrice}>${item.Price}</span>
                                </div>
                            </div>

                            <div className={styles.cardContent}>
                                <div className={styles.textContent}>
                                    <h3 className={styles.cardTitle}>{item.Title}</h3>
                                    <p className={styles.cardDescription}>{item.Description}</p>
                                </div>

                                <div className={styles.statusRow}>
                                    <span className={styles.statusLabel}>
                                        {item.Status || "Unknown"}
                                    </span>
                                    {renderDots(item.Status)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.noResults}>
                    {activeFilter === 'MY ORDERS'
                        ? "You haven't ordered any commissions yet."
                        : "You don't have any active tasks."}
                </div>
            )}
        </div>
    );
}

export default MyCommission;