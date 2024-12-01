import React, { useState, useEffect } from 'react';
import Gallery from './Gallery';
import AuthorPage from './AuthorPage';
import PaintingDetailsModal from './PaintingDetailsModal';

function HomePage() {
    const [paintings, setPaintings] = useState([]);
    const [selectedPainting, setSelectedPainting] = useState(null);
    const [showAuthorPage, setShowAuthorPage] = useState(false);
    const [authorData, setAuthorData] = useState(null);

    useEffect(() => {
        loadMainPage();
    }, []);

    const loadMainPage = () => {
        setShowAuthorPage(false);
        fetch('http://localhost:8080/api/paintings')
            .then(response => response.json())
            .then(data => setPaintings(data))
            .catch(error => console.error('Error loading the paintings:', error));
    };

    const loadAuthorPage = (creatorId) => {
        fetch(`http://localhost:8080/api/creator/${creatorId}`)
            .then(response => response.json())
            .then(data => {
                setAuthorData(data);
                setShowAuthorPage(true);
            })
            .catch(error => console.error('Error loading the author page:', error));
    };

    const closeAuthorPage = () => {
        setShowAuthorPage(false);
        setAuthorData(null);
    };

    return (
        <div className="HomePage">
            {showAuthorPage ? (
                <AuthorPage authorData={authorData} onSelectPainting={setSelectedPainting} onClose={closeAuthorPage} />
            ) : (
                <Gallery paintings={paintings} onSelectPainting={setSelectedPainting} onSelectAuthor={loadAuthorPage} />
            )}
            {selectedPainting && (
                    <PaintingDetailsModal painting={selectedPainting} onClose={() => setSelectedPainting(null)} />
            )}
        </div>
    );
}

export default HomePage;
