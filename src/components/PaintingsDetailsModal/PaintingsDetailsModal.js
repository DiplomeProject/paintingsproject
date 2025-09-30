import React from 'react';

function PaintingDetailsModal({ painting, onClose }) {
    return (
        <div
            className="modal fade show"
            tabIndex="-1"
            role="dialog"
            aria-labelledby="paintingModalLabel"
            aria-hidden="true"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)' }}
        >
            <div className="modal-dialog modal-xl modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header bg-light">
                        <h5 className="modal-title" id="paintingModalLabel">{painting.title}</h5>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            onClick={onClose}
                        ></button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-5 text-center mb-3 mb-md-0">
                                <img
                                    src={painting.Image}
                                    alt={painting.title}
                                    className="img-fluid rounded shadow-sm"
                                    style={{ maxHeight: '400px', objectFit: 'cover' }}
                                />
                            </div>
                            <div className="col-md-7">
                                <h5>Інформація про картину</h5>
                                <p>{painting.Description}</p>
                                <p className="fw-bold">{`${painting.author_name} ${painting.author_surname}`}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaintingDetailsModal;
