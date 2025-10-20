import React from 'react';
import styles from './DigitalBrushProfile.module.css';
import ArtCard from "../../../ArtCard/ArtCard";

function DigitalBrushProfile({ user, onEditProfile, onLogout }) {
    // Дані-заглушки для галереї робіт
    const works = Array.from({ length: 20 }).map((_, i) => ({
        id: i + 1,
        title: `ARTEMIS ${i + 1}`,
        price: (Math.random() * 100 + 20).toFixed(2),
        likes: `${(Math.random() * 300).toFixed(1)}k`,
        artistName: user.name,
        artistStyle: "Retro/Psychedelia",
        imageUrl: `/images/image${(i % 5) + 1}.png`,
    }));

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
                        {works.map(work => (
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

                    <div className={styles.pagination}>
                        <button>‹</button>
                        <button className={styles.activePage}>1</button>
                        <button>2</button>
                        <button>3</button>
                        <button>›</button>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default DigitalBrushProfile;