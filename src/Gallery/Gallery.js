import React, {useState, useMemo} from "react";
import styles from "./Gallery.module.css";

function Gallery() {

    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = useMemo(() => {
        return Array.from({length: 3}, () =>
            Array.from({length: 16}, (_, i) => {
                const randomIndex = Math.floor(Math.random() * 5) + 1;
                return {
                    id: `${Math.random()}-${i}`,
                    image: `/images/image${randomIndex}.png`,
                    artist: "We build the",
                    views: "213 k",
                    title: "We build the",
                    price: "25",
                };
            })
        );
    }, []);
    return (
        <main id="mainContent" className={styles.container}>
            <div className={styles.gallery}>
                {/* --- ВЕРХНЯЯ СЕКЦИЯ (которая пропала) --- */}
                <div className={styles.ScrollContainer}>
                    <div className={styles.scrollingGrid}>
                        <div className={styles.gridTrack}>
                            {[...Array(2)].map((_, trackIndex) => (
                                <div key={trackIndex} className={styles.imageGrid}>
                                    {[...Array(32)].map((_, i) => {
                                        const randomIndex = Math.floor(Math.random() * 5) + 1;
                                        return (
                                            <div
                                                key={`${trackIndex}-${i}`}
                                                className={styles.gridImage}
                                                style={{backgroundImage: `url(/images/image${randomIndex}.png)`}}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles['main-image']}/> {/* Используем bracket-нотацию для имени с дефисом */}
                </div>

                {/* ИСПРАВЛЕНО: Правильная обертка для секций с текстом */}
                <div className={styles.textContentWrapper}>
                    {/* --- Секция 1: Для художников --- */}
                    <div className={styles.contentSection}>
                        <div className={styles.textContainer}>
                            <div className={styles.textHeader1}>
                                Are you an artist? <br/> Sell your work here!
                            </div>
                            <div className={styles.text1}>
                                Create a profile, upload your paintings, and find buyers all over the world. DigitalBrush is a
                                space where your talent becomes visible and valuable.
                            </div>
                            <button className={styles.button1}>Registration</button>
                        </div>
                        <div className={styles.imageCardsContainer}>
                            <div className={styles.imageCard3}>
                                <div className={styles.imageCard3Img}></div>
                            </div>
                            <div className={styles.imageCard1}>
                                <div className={styles.imageCard1Img}></div>
                            </div>
                            <div className={styles.imageCard2}>
                                <div className={styles.imageCard2Img}></div>
                            </div>
                        </div>
                    </div>

                    {/* --- Секция 2: Для покупателей --- */}
                    <div className={styles.contentSection}>
                        <div className={styles.ImagesContainer}>
                            <div className={styles.image1}></div>
                            <div className={styles.image2}></div>
                            <div className={styles.image3}></div>
                            <div className={styles.image4}></div>
                            <div className={styles.image5}></div>
                        </div>
                        <div className={styles.textContainer}>
                            <div className={styles.textHeader1}>
                                Don't you draw? <br/> No problem.
                            </div>
                            <div className={styles.text1}>
                                Choose works that resonate with your emotions. Here, art is not just a commodity, but a way to
                                tell the world something important.
                            </div>
                            <button className={styles.button1}>Registration</button>
                        </div>
                    </div>
                </div>

                {/* ИСПРАВЛЕНО: Оставили эту обертку только для секции с трендами, как и должно быть */}
                <div className={styles.trendsContentWrapper}>
                    <div className={styles.TrendsContainer}>
                        <div className={styles.TrendsHeader}> TRENDS</div>
                        <div className={styles.searchBarContainer}>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Title of the art"
                            />
                            <button className={styles.searchButton}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d="M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" stroke="currentColor"
                                          strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className={styles['art-grid-section']}>
                        <div className={styles['art-grid-carousel-wrapper']}>
                            <div
                                className={styles['art-grid-carousel']}
                                style={{transform: `translateX(-${currentSlide * 100}%)`}}
                            >
                                {slides.map((slide, index) => (
                                    <div
                                        key={index}
                                        className={styles['art-grid-slide']}
                                    >
                                        {slide.map((card) => (
                                            <div key={card.id} className={styles['art-card']}>
                                                <div
                                                    className={styles['art-card-image']}
                                                    style={{backgroundImage: `url(${card.image})`}}
                                                />
                                                <div className={styles['art-card-info']}>
                                                    <div className={styles['art-card-meta']}>
                                                        <span className="art-card-artist">{card.artist}</span>
                                                        <span className="art-card-views">
                                        <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                        <path
                                            d="M12 5C7 5 2.73 8.11 1 12.5 2.73 16.89 7 20 12 20s9.27-3.11 11-7.5C21.27 8.11 17 5 12 5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                                            fill="currentColor"
                                        />
                                        </svg>
                                                            {card.views}
                                    </span>
                                                    </div>
                                                    <div className={styles['art-card-title']}>{card.title}</div>
                                                    <div className={styles['art-card-price']}>{card.price}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <div className={styles['carousel-dots']}>
                                {slides.map((_, i) => (
                                    <span
                                        key={i}
                                        className={`${styles.dot} ${currentSlide === i ? styles.active : ""}`}
                                        onClick={() => setCurrentSlide(i)}
                                    ></span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Gallery;