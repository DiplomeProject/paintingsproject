import React from 'react';
import Gallery from './Gallery';

function AuthorPage({ authorData, onSelectPainting, onClose }) {
    return (
        <div className="modal fade show" tabIndex="-1" role="dialog" aria-labelledby="authorModalLabel" aria-hidden="true" style={{ display: 'block' }}>
            <div className="modal-dialog modal-fullscreen" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="authorModalLabel">{authorData.name} {authorData.surname}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-4 text-center">
                                <img id="profile-image" src={authorData.profileImage} alt="Avatar" className="img-fluid rounded-circle" style={{ width: '150px', height: '150px' }} />
                                <h3>{authorData.name} {authorData.surname}</h3>
                                <p><strong>Про себе:</strong></p>
                                <p>{authorData.bio}</p>
                                <p><strong>Контактна інформація:</strong></p>
                                <p>{authorData.email}</p>
                            </div>
                            <div className="col-md-8">
                                <h4>Картини:</h4>
                                {/* Добавляем галерею с возможностью прокрутки, если картин слишком много */}
                                <div style={{ maxHeight: '1000px'}}>
                                    <Gallery paintings={authorData.paintings} onSelectPainting={onSelectPainting} onSelectAuthor={authorData} />
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
