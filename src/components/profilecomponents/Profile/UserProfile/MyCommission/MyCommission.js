import React, { useState, useEffect } from 'react';
import styles from './MyCommission.module.css';
import CategoryFilters from "../../../../CategoryFilters/CategoryFilters";

const commissionFilters = ['MY ORDERS', 'MY TASKS'];

// ... DUMMY_DB_DATA залишається без змін ...
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
    const currentUserId = user?.id ? Number(user.id) : 1;

    const [activeFilter, setActiveFilter] = useState('MY ORDERS');
    const [commissions, setCommissions] = useState([]);

    useEffect(() => {
        // Адаптуємо мокові дані під поточного юзера (якщо у даних ID=2, міняємо на ваш)
        const adjustedData = DUMMY_DB_DATA.map(item => ({
            ...item,
            Customer_ID: item.Customer_ID === 2 ? currentUserId : item.Customer_ID,
            Creator_ID: item.Creator_ID === 2 ? currentUserId : item.Creator_ID
        }));
        setCommissions(adjustedData);
    }, [currentUserId]);

    const handleFilterClick = (category) => {
        setActiveFilter(category);
    };

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

    // ОНОВЛЕНА ФУНКЦІЯ RENDER DOTS
    const renderDots = (status) => {
        const filledCount = getFilledDotsCount(status);
        const dots = [];
        for (let i = 0; i < 3; i++) {
            // Визначаємо стиль для кожної конкретної крапки
            let specificClass = '';
            if (i === 0) specificClass = styles.dotFirst;
            if (i === 1) specificClass = styles.dotSecond;
            if (i === 2) specificClass = styles.dotThird;

            dots.push(
                <div
                    key={i}
                    className={`${styles.dot} ${specificClass} ${i < filledCount ? styles.filled : ''}`}
                ></div>
            );
        }
        return <div className={styles.dotsContainer}>{dots}</div>;
    };

    return (
        <div className={styles.container}>
            <div className={styles.filtersWrapper}>
                <CategoryFilters
                    categories={commissionFilters}
                    activeCategory={activeFilter}
                    onCategoryClick={handleFilterClick}
                />
            </div>

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