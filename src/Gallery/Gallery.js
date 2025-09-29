import React from 'react';
import './Gallery.css';

function Gallery({ paintings, onSelectPainting, onSelectAuthor }) {
    return (
        <main id="mainContent" className="container">
            <div className="gallery">
                <div className="gallery-grid">
                    {paintings.map((painting) => (
                        <div key={painting.id} className="gallery-item">
                            <div
                                className="card"
                                onClick={() => onSelectPainting(painting)}
                            >
                                <img
                                    className="card-img"
                                    src={painting.Image}
                                    alt={painting.title}
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{painting.title}</h5>
                                    <p className="card-text">
                                        Автор:{" "}
                                        <span
                                            className="author-link"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectAuthor && onSelectAuthor(painting.Creator_ID);
                                            }}
                                        >
                                            {painting.author_name || "Неизвестно"} {painting.author_surname || ""}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

export default Gallery;
