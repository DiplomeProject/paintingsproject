import React, { useMemo, useState } from "react";
import "./Shop.css";

const categories = [
  "2D AVATARS",
  "3D MODELS",
  "READING",
  "BRENDING",
  "ICONS",
  "GAMES",
  "MOCKUPS",
  "UI/UX",
];

const Shop = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 21;

  // Generate 63 demo cards (3 pages)
  const cards = useMemo(() => {
    return Array.from({ length: 63 }, (_, i) => {
      const randomIndex = Math.floor(Math.random() * 5) + 1;
      return {
        id: i,
        image: `/images/image${randomIndex}.png`,
        artist: "Digital Artist",
        views: `${Math.floor(Math.random() * 500)}k`,
        title: `Artwork #${i + 1}`,
        price: `$${(Math.random() * 200 + 20).toFixed(0)}`,
      };
    });
  }, []);

  const totalPages = Math.ceil(cards.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const displayedCards = cards.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="containerShop">
      <div className="shop-container">
        {/* Header + Search */}
        <div className="ShopContainer">
          <div className="ShopHeader">Shop</div>
          <div className="searchBarContainer">
            <input
              type="text"
              className="searchInput"
              placeholder="Title of the art"
            />
            <button className="searchButton">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
                  stroke="black"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Category Buttons */}
        <div className="categoryGrid">
          {categories.map((cat, index) => (
            <button key={index} className="categoryButton">
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Cards */}
        <div className="CardsContainer">
          <div className="art-grid-full">
            {displayedCards.map((card) => (
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

          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
              disabled={currentPage === 0}
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`page-number ${i === currentPage ? "active" : ""}`}
                onClick={() => setCurrentPage(i)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages - 1))}
              disabled={currentPage === totalPages - 1}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;



// шрифт фильтров, сохранить цвет ховера при нажатии на фильтр, поставить иконки в карточки