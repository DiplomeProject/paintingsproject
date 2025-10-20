import React from 'react';
import styles from './DigitalBrushProfile.module.css';

export default function DigitalBrushProfile() {
    const works = Array.from({ length: 20 }).map((_, i) => ({
        id: i + 1,
        title: `ARTEMIS ${i + 1}`,
        price: 25,
        img: `/assets/thumb${(i % 5) + 1}.jpg`,
    }));

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.logoNav}>
                    <div className={styles.logo}>Digital Brush</div>
                    <nav className={styles.nav}>
                        <a href="#">MAIN</a>
                        <a href="#">SHOP</a>
                        <a href="#">ARTISTS</a>
                        <a href="#">COMMISSION</a>
                    </nav>
                </div>
                <div className={styles.icons}>
                    <div className={styles.icon}>🛒</div>
                    <div className={styles.icon}>⚙️</div>
                </div>
            </header>

            {/* Main */}
            <main className={styles.main}>
                <aside className={styles.profile}>
                    <div className={styles.profileCard}>
                        <div className={styles.avatarContainer}>
                            <img src="/assets/profile.jpg" alt="Kira Kudo" className={styles.avatar} />
                        </div>
                        <h2 className={styles.name}>Kira Kudo <span className={styles.status}>(available)</span></h2>
                        <div className={styles.info}>
                            <div>Retro/Psychedelia</div>
                            <div>En/Укр</div>
                            <div className={styles.followers}>52.5k</div>
                        </div>
                        <p className={styles.description}>
                            I create visual solutions that not only look good, but also work helping businesses stand out and users enjoy the interaction.
                        </p>
                        <div className={styles.buttons}>
                            <button>Settings profile</button>
                            <button>Add image</button>
                            <button>My Commission</button>
                            <button>Payment</button>
                            <button>Calendar</button>
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
                        {works.map(w => (
                            <article key={w.id} className={styles.card}>
                                <div className={styles.imageContainer}>
                                    <img src={w.img} alt={w.title} className={styles.image} />
                                </div>
                                <div className={styles.caption}>We build the</div>
                                <div className={styles.cardFooter}>
                                    <div className={styles.cardTitle}>{w.title}</div>
                                    <div className={styles.cardPrice}>{w.price}$</div>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className={styles.pagination}>
                        <button className={styles.activePage}>1</button>
                        <button>2</button>
                        <button>3</button>
                    </div>
                </section>
            </main>

            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div>
                        <div className={styles.footerLogo}>Digital Brush</div>
                        <p className={styles.footerText}>
                            This is a space that unites artists and customers, ensures transparency, security, and convenience of cooperation, promotes the development of the creative economy, and supports digital culture.
                        </p>
                    </div>
                    <div className={styles.contact}>
                        <div>Contact us if you have any problems: digital_brush@gmail.com</div>
                        <div className={styles.follow}>Follow us:</div>
                        <div className={styles.socials}>
                            <div>T</div>
                            <div>F</div>
                            <div>I</div>
                        </div>
                    </div>
                </div>
                <div className={styles.copy}>2025</div>
            </footer>
        </div>
    );
}
