import React from 'react';
import Gallery from './Gallery';

function AuthorPage({ authorData, onSelectPainting, onClose }) {
    return (
        <div
            className="modal fade show"
            tabIndex="-1"
            role="dialog"
            aria-labelledby="authorModalLabel"
            aria-hidden="true"
            style={{ display: 'block' }}
        >
            <div className="modal-dialog modal-fullscreen" role="document">
                <div className="modal-content shadow-lg border-0 rounded-3">

                    {/* Заголовок */}
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title fw-bold" id="authorModalLabel">
                            {authorData.name} {authorData.surname}
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            onClick={onClose}
                        ></button>
                    </div>

                    {/* Основной контент */}
                    <div className="modal-body">
                        <div className="row g-4">

                            {/* Левая колонка */}
                            <div className="col-md-4 text-center">
                                <img
                                    id="profile-image"
                                    src={authorData.profileImage}
                                    alt="Avatar"
                                    className="img-fluid rounded-circle shadow-sm mb-3"
                                    style={{ width: '180px', height: '180px', objectFit: 'cover' }}
                                />
                                <h3 className="fw-bold">{authorData.name} {authorData.surname}</h3>

                                <div className="mt-3">
                                    <p className="fw-semibold text-muted">Про себе:</p>
                                    <p>{authorData.bio}</p>
                                </div>

                                <div className="mt-3">
                                    <p className="fw-semibold text-muted">Контактна інформація:</p>
                                    <p className="mb-0">{authorData.email}</p>
                                </div>
                            </div>

                            {/* Правая колонка */}
                            <div className="col-md-8">
                                <h4 className="fw-bold mb-3">Картини</h4>
                                <div className="overflow-auto p-2 border rounded" style={{ maxHeight: '70vh' }}>
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
        </div>
    );
}

export default AuthorPage;
