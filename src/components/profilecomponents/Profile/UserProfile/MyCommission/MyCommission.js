import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './MyCommission.module.css';
import CategoryFilters from "../../../../CategoryFilters/CategoryFilters";
import CommissionModalDetails from "../../../../Commission/CommissionModals/CommissionModalDetails";
import logo from '../../../../../assets/logo.svg'

const commissionFilters = ['MY ORDERS', 'MY TASKS'];

// ... DUMMY_DB_DATA залишається без змін ...
// const DUMMY_DB_DATA = [
//     {
//         Commission_ID: 101,
//         Title: "Retro Poster Design",
//         Description: "Need a vintage style poster for an exhibition.",
//         Price: 45,
//         ReferenceImage: "/images/placeholder.png",
//         Category: "BOOKS",
//         Status: "Sketch",
//         Customer_ID: 2,
//         Creator_ID: 55
//     },
//     {
//         Commission_ID: 102,
//         Title: "Cyberpunk Character",
//         Description: "Full body character art in cyberpunk style.",
//         Price: 120,
//         ReferenceImage: "/images/placeholder.png",
//         Category: "2D AVATARS",
//         Status: "Completed",
//         Customer_ID: 99,
//         Creator_ID: 2
//     },
//     {
//         Commission_ID: 103,
//         Title: "Logo for Coffee Shop",
//         Description: "Minimalist logo design.",
//         Price: 30,
//         ReferenceImage: "/images/placeholder.png",
//         Status: "Search",
//         Customer_ID: 2,
//         Creator_ID: null
//     },
//     {
//         Commission_ID: 104,
//         Title: "Album Cover",
//         Description: "Abstract art for music album.",
//         Price: 80,
//         ReferenceImage: "/images/placeholder.png",
//         Status: "Edits",
//         Customer_ID: 77,
//         Creator_ID: 2
//     }
// ];

function MyCommission({ user, onOpenChat}) {
    const currentUserId = user?.id ? Number(user.id) : 1;

    const [activeFilter, setActiveFilter] = useState('MY ORDERS');
    const [commissions, setCommissions] = useState([]);
    const [selectedCommission, setSelectedCommission] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleCardClick = (item) => {
        const creatorId = item.Creator_ID || item.creator_id;
        const statusRaw = item.Status || item.status || '';
        const status = statusRaw.toLowerCase();

        console.log("Card Click info:", {
            id: item.Commission_ID,
            creatorId: creatorId,
            status: status
        });
        const isTaken = (creatorId && status !== 'open' && status !== 'search') ||
            (status === 'in_progress' || status === 'edits' || status === 'completed');

        if (isTaken) {
            console.log("Action: Opening Chat");
            if (onOpenChat) {
                onOpenChat(item.Commission_ID || item.id);
            }
        } else {
            console.log("Action: Opening Modal Details");
            setSelectedCommission(prepareModalData(item));
        }
    };

    useEffect(() => {
        if (!currentUserId) return;

        setIsLoading(true);
        axios.get('http://localhost:8080/api/commissions/my', { withCredentials: true })
            .then(response => {
                if (response.data.success) {
                    setCommissions(response.data.commissions);
                }
            })
            .catch(error => {
                console.error("Error fetching my commissions:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [currentUserId]);

    const handleFilterClick = (category) => {
        setActiveFilter(category);
    };

    const displayedCommissions = commissions.filter(item => {
        const itemCustomerId = Number(item.Customer_ID);
        const itemCreatorId = Number(item.Creator_ID);

        if (activeFilter === 'MY ORDERS') {
            return itemCustomerId === currentUserId;
        } else if (activeFilter === 'MY TASKS') {
            return itemCreatorId === currentUserId;
        }
        return false;
    });

    const getFilledDotsCount = (status) => {
        switch (status?.toLowerCase()) {
            case 'in_progress': return 1;
            case 'completed': return 2;
            case 'cancelled': return 3;
            case 'search': return 0;
            case 'open': return 0;
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

    const prepareModalData = (item) => {
        return {
            id: item.Commission_ID,
            title: item.Title,
            description: item.Description,
            price: item.Price,
            imageUrl: item.ReferenceImage, // Це поле ми обробили на бекенді
            category: item.Category || "Unknown",
            style: item.Style || "Unknown",
            fileFormat: item.Format || "Unknown",
            size: item.Size || "Unknown",
            // Додаємо статус, якщо потрібно відобразити в модалці
            status: item.Status
        };
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    {/* Використовуйте ваш лоадер або просто текст */}
                    <img src={logo} alt="Loading..."  className={styles.loadingLogo}/>
                </div>
            </div>
        );
    }

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
                        <div key={item.Commission_ID} className={styles.commissionCard}
                             onClick={() => handleCardClick(item)}
                             style={{ cursor: 'pointer' }}>
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

            {selectedCommission && (
                <CommissionModalDetails
                    commission={selectedCommission}
                    onClose={() => setSelectedCommission(null)}
                />
            )}
        </div>
    );
}

export default MyCommission;