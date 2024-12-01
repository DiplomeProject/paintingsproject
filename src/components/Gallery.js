import React from 'react';
import Card from 'react-bootstrap/Card';

function Gallery({ paintings, onSelectPainting, onSelectAuthor }) {
    return (
        <main id="mainContent">
            <div className="gallery">
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                    {paintings.map(painting => (
                        <div key={painting.id} className="col">
                            <Card className="painting" style={{
                                background: "transparent",
                                borderRadius: "10px",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                                overflow: "hidden"
                            }} onClick={() => onSelectPainting(painting)}>
                                <Card.Img variant="top" src={painting.Image} alt={painting.title} style={{
                                    width: '100%',
                                    height: '150px',
                                    objectFit: 'cover'
                                }} />
                                <Card.Body className="info">
                                    <Card.Title>{painting.title}</Card.Title>
                                    <Card.Text>
                                        Автор:
                                        <span className="author-name" onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectAuthor(painting.Creator_ID);
                                        }}>
                                            {painting.author_name || onSelectAuthor.name} {painting.author_surname || onSelectAuthor.surname}
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
