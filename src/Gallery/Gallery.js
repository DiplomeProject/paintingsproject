import React, { useState, useMemo } from "react";
import "./Gallery.css";

function Gallery() {

  const [currentSlide, setCurrentSlide] = useState(0);
    
    const slides = useMemo(() => {
    return Array.from({ length: 3 }, () =>
      Array.from({ length: 16 }, (_, i) => {
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
        <main id="mainContent" className="container">
            <div className="gallery">
                <div className="ScrollContainer">
                    <div className="scrollingGrid">
                        <div className="gridTrack">
                        {[...Array(2)].map((_, trackIndex) => (
                            <div key={trackIndex} className="imageGrid">
                            {[...Array(32)].map((_, i) => {
                                const randomIndex = Math.floor(Math.random() * 5) + 1;
                                return (
                                <div
                                    key={`${trackIndex}-${i}`}
                                    className="gridImage"
                                    style={{ backgroundImage: `url(/images/image${randomIndex}.png)` }}
                                />
                                );
                            })}
                            </div>
                        ))}
                        </div>
                    </div>
                    <div className="main-image" />
                </div>

                <div className="textContainer1">
                    <div className="textHeader1">
                        Are you an artist? <br /> Sell your work here!
                    </div>
                    <div className="text1">
                        Create a profile, upload your paintings, and find buyers all over the world. DigitalBrush is a space where your talent becomes visible and valuable.
                    </div>
                    <button className='button1'>Registration</button>
                </div>
                <div className="imageCardsContainer">
                    <div className="imageCard1"><div className="imageCard1Img"></div></div>
                    <div className="imageCard2"><div className="imageCard2Img"></div></div>
                    <div className="imageCard3"><div className="imageCard3Img"></div></div>
                </div>

                <div className="ImagesContainer">
                    <div className="image1"></div>
                    <div className="image2"></div>
                    <div className="image3"></div>
                    <div className="image4"></div>
                    <div className="image5"></div>
                </div>
                <div className="textContainer2">
                    <div className="textHeader1">
                        Don't you draw? <br /> No problem. 
                    </div>
                    <div className="text1">
                        Choose works that resonate with your emotions. Here, art is not just a commodity, but a way to tell the world something important.
                    </div>
                    <button className='button1'>Registration</button>
                    <div className='TrendsContainer'>
                        <div className='TrendsHeader'> TRENDS</div>
                        <div className="searchBarContainer">
                        <input
                            type="text"
                            className="searchInput"
                            placeholder="Title of the art"
                        />
                        <button className="searchButton">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        </div>
                    </div>
                    <div className="art-grid-section">
                        <div className="art-grid-carousel-wrapper">
                            <div
                            className="art-grid-carousel"
                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                            >
                            {slides.map((slide, index) => (
                                <div
                                key={index}
                                className="art-grid-slide"
                                >
                                {slide.map((card) => (
                                    <div key={card.id} className="art-card">
                                    <div
                                        className="art-card-image"
                                        style={{ backgroundImage: `url(${card.image})` }}
                                    />
                                    <div className="art-card-info">
                                        <div className="art-card-meta">
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
                                        <div className="art-card-title">{card.title}</div>
                                        <div className="art-card-price">{card.price}</div>
                                    </div>
                                    </div>
                                ))}
                                </div>
                            ))}
                            </div>

                            {/* Dots Navigation */}
                            <div className="carousel-dots">
                            {slides.map((_, i) => (
                                <span
                                key={i}
                                className={`dot ${currentSlide === i ? "active" : ""}`}
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


