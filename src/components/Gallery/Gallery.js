import React, { useState, useMemo, useEffect } from "react";
import styles from "./Gallery.module.css";

// Дані-заглушки для верхньої секції
const placeholderFeaturedCards = [
    { id: 'card-back', imageUrl: '/images/card-center.png', className: styles.cardBack, title: "We build the", likes: "253.5k" },
    { id: 'card-middle', imageUrl: '/images/card-right.png', className: styles.cardMiddle, title: "We build the", likes: "253.5k" },
    { id: 'card-front', imageUrl: '/images/card-left.png', className: styles.cardFront, title: "We build the", likes: "253.5k" }
];
const placeholderScatteredImages = [
    { id: 'scatter-1', imageUrl: '/images/image1.png', className: styles.image1 },
    { id: 'scatter-2', imageUrl: '/images/image5.png', className: styles.image2 },
    { id: 'scatter-3', imageUrl: '/images/image4.png', className: styles.image3 },
    { id: 'scatter-4', imageUrl: '/images/image2.png', className: styles.image4 },
    { id: 'scatter-5', imageUrl: '/images/image3.png', className: styles.image5 }
];

function Gallery({ paintings: paintingsFromProps = [] }) {

    const [currentSlide, setCurrentSlide] = useState(0);
    const [featuredCards, setFeaturedCards] = useState([]);
    const [scatteredImages, setScatteredImages] = useState([]);

    useEffect(() => {
        setFeaturedCards(placeholderFeaturedCards);
        setScatteredImages(placeholderScatteredImages);
    }, []);

    const gridPaintings = useMemo(() => {
        if (paintingsFromProps && paintingsFromProps.length > 0) {
            return [...paintingsFromProps, ...paintingsFromProps];
        }
        return Array.from({ length: 32 }, (_, i) => ({ id: `ph-${i}`, imageUrl: `/images/image${(i % 5) + 1}.png` }));
    }, [paintingsFromProps]);

    // ОНОВЛЕНО: Генерація даних для "Trends" з новою структурою
    const slides = useMemo(() => {
        return Array.from({ length: 3 }, () =>
            Array.from({ length: 16 }, (_, i) => {
                const randomIndex = Math.floor(Math.random() * 5) + 1;
                return {
                    id: `${Math.random()}-${i}`,
                    imageUrl: `/images/image${randomIndex}.png`,
                    title: "Image Image",
                    artistName: "Artist Artist",
                    artistStyle: "Style",
                    likes: "253.5k",
                    price: "36,50",
                };
            })
        );
    }, []);

    return (
        <main id="mainContent" className={styles.container}>
            <div className={styles.gallery}>
                {/* --- ВЕРХНЯ СЕКЦІЯ --- */}
                <div className={styles.ScrollContainer}>
                    <div className={styles.scrollingGrid}>
                        <div className={styles.gridTrack}>
                            {[...Array(2)].map((_, trackIndex) => (
                                <div key={trackIndex} className={styles.imageGrid}>
                                    {gridPaintings.map((painting, i) => (
                                        <div
                                            key={`${trackIndex}-${painting.id}-${i}`}
                                            className={styles.gridImage}
                                            style={{ backgroundImage: `url(${painting.imageUrl})` }}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles['main-image']} />
                </div>

                {/* --- СЕКЦІЇ З КОНТЕНТОМ --- */}
                <div className={styles.textContentWrapper}>
                    {/* --- Секція 1: Для художників --- */}
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
                            {featuredCards.map(card => (
                                <div key={card.id} className={card.className}> {/* Зовнішня рамка */}
                                    <div className={styles.cardContentWrapper}>
                                        <div
                                            className={styles.cardImage} /* Верхня частина з картинкою */
                                            style={{ backgroundImage: `url(${card.imageUrl})` }}
                                        ></div>
                                        <div className={styles.cardInfo}> {/* Нижня частина з текстом */}
                                            <p className={styles.cardTitle}>{card.title}</p>
                                            <span className={styles.cardLikes}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                                </svg>
                                                {card.likes}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- Секція 2: Для покупців --- */}
                    <div className={styles.contentSection}>
                        <div className={styles.ImagesContainer}>
                            {scatteredImages.map(image => (
                                <div
                                    key={image.id}
                                    className={image.className}
                                    style={{ backgroundImage: `url(${image.imageUrl})` }}
                                />
                            ))}
                        </div>
                        <div className={styles.textContainer}>
                            <div className={styles.textHeader1}>
                                Don't you draw? <br /> No problem.
                            </div>
                            <div className={styles.text1}>
                                Choose works that resonate with your emotions. Here, art is not just a commodity, but a way to
                                tell the world something important.
                            </div>
                            <button className={styles.button1}>Registration</button>
                        </div>
                    </div>
                </div>

                {/* --- СЕКЦІЯ "TRENDS" --- */}
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
                                          strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className={styles.artGridSection}>
                        <div className={styles.artGridCarouselWrapper}>
                            <div
                                className={styles.artGridCarousel}
                                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                            >
                                {slides.map((slide, index) => (
                                    <div
                                        key={index}
                                        className={styles.artGridSlide}
                                    >
                                        {slide.map((card) => (
                                            // ОНОВЛЕНО: JSX структура для art-card
                                            <div key={card.id} className={styles.artCard}>
                                                <div
                                                    className={styles.artCardImage}
                                                    style={{ backgroundImage: `url(${card.imageUrl})` }}
                                                />
                                                <div className={styles.artCardInfo}>
                                                    <div className={styles.artCardDetails}>
                                                        <span className={styles.artCardTitle}>{card.title}</span>
                                                        <span className={styles.artCardArtist}>
                                                            {card.artistName} / {card.artistStyle}
                                                        </span>
                                                    </div>
                                                    <div className={styles.artCardMeta}>
                                                        <span className={styles.artCardLikes}>
                                                             <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                                            {card.likes}
                                                        </span>
                                                        <span className={styles.artCardPrice}>$ {card.price}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <div className={styles.carouselDots}>
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