import React from 'react';
import Gallery from '../../Gallery/Gallery';
import './AuthorPage.css';

function AuthorPage({ authorData, onSelectPainting, onClose }) {
    if (!authorData) return null;

    return (
        <div className="author-modal-overlay" onClick={onClose}>
            <div className="author-modal-content" onClick={e => e.stopPropagation()}>
                <div className="author-modal-header">
                    <h5 className="author-modal-title">
                        {authorData.name}   
                    </h5>
                    <button className="author-modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="author-modal-body">
                    <div className="author-grid">
                        {/* Левая колонка */}
                        <div className="author-left">
                            <img
                                src={authorData.profileImage}
                                alt="Avatar"
                                className="author-profile-image"
                            />
                            <h3>{authorData.name}</h3>

                            <div className="author-section">
                                <p className="section-title">Про себе:</p>
                                <p>{authorData.bio}</p>
                            </div>

                            <div className="author-section">
                                <p className="section-title">Контактна інформація:</p>
                                <p>{authorData.email}</p>
                            </div>
                        </div>

                        {/* Правая колонка */}
                        <div className="author-right">
                            <h4>Картини</h4>
                            <div className="gallery-container">
                                <Gallery
                                    paintings={authorData.paintings}
                                    onSelectPainting={onSelectPainting}
                                    onSelectAuthor={authorData}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthorPage;
