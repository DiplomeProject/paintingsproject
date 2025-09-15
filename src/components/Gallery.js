import React from 'react';
import Card from 'react-bootstrap/Card';

function Gallery({ paintings, onSelectPainting, onSelectAuthor }) {
    return (
        <main id="mainContent" className="container py-4">
            <div className="gallery">
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                    {paintings.map((painting) => (
                        <div key={painting.id} className="col">
                            <Card
                                className="h-100 shadow-sm"
                                style={{ borderRadius: '10px', cursor: 'pointer' }}
                                onClick={() => onSelectPainting(painting)}
                            >
                                <Card.Img
                                    variant="top"
                                    src={painting.Image}
                                    alt={painting.title}
                                    style={{ height: '150px', objectFit: 'cover' }}
                                />
                                <Card.Body>
                                    <Card.Title className="fw-bold">{painting.title}</Card.Title>
                                    <Card.Text>
                                        Автор:{" "}
                                        <span
                                            className="text-primary"
                                            style={{ cursor: 'pointer' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectAuthor && onSelectAuthor(painting.Creator_ID);
                                            }}
                                        >
                  {painting.author_name || "Неизвестно"} {painting.author_surname || ""}
                </span>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </main>

    );
}

export default Gallery;
