import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Gallery from '../Gallery/Gallery';
import AuthorPage from '../AuthorPage/AuthorPage';
import PaintingDetailsModal from '../PaintingsDetailsModal/PaintingsDetailsModal';
import Navbar from '../Nav/Nav';
import Footer from '../Footer/Footer';
import url from '../../URL';

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
        axios.get(`/paintings`)
            .then(res => setPaintings(res.data))
            .catch(error => console.error('Error loading the paintings:', error));
    };

    const loadAuthorPage = (creatorId) => {
        axios.get(`/artists/artist/${creatorId}`)
            .then(res => {
                setAuthorData(res.data);
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
            <main>
                {showAuthorPage ? (
                    <AuthorPage
                        authorData={authorData}
                        onSelectPainting={setSelectedPainting}
                        onClose={closeAuthorPage}
                    />
                ) : (
                    <Gallery
                        paintings={paintings}
                        onSelectPainting={setSelectedPainting}
                        onSelectAuthor={loadAuthorPage}
                    />
                )}

                {selectedPainting ? (
                    <PaintingDetailsModal
                        painting={selectedPainting}
                        onClose={() => setSelectedPainting(null)}
                    />
                ) : null}
            </main>
        </div>
    );
}

export default HomePage;