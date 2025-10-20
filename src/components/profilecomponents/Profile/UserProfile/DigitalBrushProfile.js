import React, { useState, useMemo } from 'react'; // 1. Імпортуємо useState та useMemo
import styles from './DigitalBrushProfile.module.css';
import ArtCard from "../../../ArtCard/ArtCard";

function DigitalBrushProfile({ user, onEditProfile, onLogout }) {
    // 2. ДОДАНО: Стан для пагінації
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 24; // Кількість карток на одній сторінці

    // Дані-заглушки для галереї робіт
    const works = useMemo(() => Array.from({ length: 200 }, (_, i) => ({ // Збільшимо кількість для демонстрації
        id: i + 1,
        title: `ARTEMIS ${i + 1}`,
        price: (Math.random() * 100 + 20).toFixed(2),
        likes: `${(Math.random() * 300).toFixed(1)}k`,
        artistName: user.name,
        artistStyle: "Retro/Psychedelia",
        imageUrl: `/images/shopAndOtherPageImages/image${(i % 4) + 1}.png`,
    })), [user.name]);

    // 3. ДОДАНО: Логіка для відображення карток лише поточної сторінки
    const totalPages = Math.ceil(works.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const displayedWorks = works.slice(startIndex, startIndex + itemsPerPage);

    // 4. ДОДАНО: Функція для "розумної" пагінації
    const renderPageNumbers = () => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={i === currentPage ? styles.activePage : ''} onClick={() => setCurrentPage(i)}>
                    {i + 1}
                </button>
            ));
        }

        const pages = [];
        // Перша сторінка
        pages.push(<button key={0} className={0 === currentPage ? styles.activePage : ''} onClick={() => setCurrentPage(0)}>1</button>);
        // ...
        if (currentPage > 2) {
            pages.push(<span key="dots1" className={styles.paginationDots}>...</span>);
        }
        // Сторінки навколо поточної
        if (currentPage > 0 && currentPage < totalPages - 1) {
            pages.push(<button key={currentPage} className={styles.activePage} onClick={() => setCurrentPage(currentPage)}>{currentPage + 1}</button>);
        }
        // ...
        if (currentPage < totalPages - 3) {
            pages.push(<span key="dots2" className={styles.paginationDots}>...</span>);
        }
        // Остання сторінка
        pages.push(<button key={totalPages - 1} className={totalPages - 1 === currentPage ? styles.activePage : ''} onClick={() => setCurrentPage(totalPages - 1)}>{totalPages}</button>);

        return pages;
    };


    return (
        <div className={styles.profileView}>
            <main className={styles.main}>
                <aside className={styles.profileSidebar}>
                    <div className={styles.profileCard}>
                        <div className={styles.avatarContainer}>
                            <img src={user.profileImage || "/images/icons/profile.jpg"} alt={`${user.name} ${user.surname}`} className={styles.avatar} />
                        </div>
                        <h2 className={styles.name}>{user.name} {user.surname} <span className={styles.status}>(available)</span></h2>
                        <div className={styles.info}>
                            <span>Retro/Psychedelia</span>
                            <span>En/Укр</span>
                            <span className={styles.followers}>52.5k Followers</span>
                        </div>
                        <p className={styles.description}>
                            {user.bio || "I create visual solutions that not only look good, but also work..."}
                        </p>
                        <div className={styles.buttons}>
                            {/* ОНОВЛЕНО: Кнопки тепер функціональні */}
                            <button onClick={onEditProfile}>Settings profile</button>
                            <button>Add image</button>
                            <button>My Commission</button>
                            <button>Payment</button>
                            <button onClick={onLogout}>Logout</button>
                        </div>
                    </div>
                </aside>

                <section className={styles.gallerySection}>
                    <div className={styles.filters}>
                        <div className={styles.filterButtons}>
                            <button className={styles.active}>ICONS</button>
                            <button>UI/UX</button>
                            <button>ADVERTISING</button>
                            <button>BRANDING</button>
                        </div>
                        <div className={styles.additional}>ADDITIONAL FILTERS ▾</div>
                    </div>

                    <div className={styles.gallery}>
                        {/* 5. ОНОВЛЕНО: Відображаємо displayedWorks замість works */}
                        {displayedWorks.map(work => (
                            <ArtCard
                                key={work.id}
                                imageUrl={work.imageUrl}
                                title={work.title}
                                artistName={work.artistName}
                                artistStyle={work.artistStyle}
                                likes={work.likes}
                                price={work.price}
                            />
                        ))}
                    </div>

                    {/* 6. ОНОВЛЕНО: Повністю замінено блок пагінації */}
                    <div className={styles.pagination}>
                        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 0))} disabled={currentPage === 0}>
                            ‹
                        </button>
                        {renderPageNumbers()}
                        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages - 1))} disabled={currentPage === totalPages - 1}>
                            ›
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default DigitalBrushProfile;