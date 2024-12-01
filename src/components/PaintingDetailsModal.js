import React from 'react';

function PaintingDetailsModal({ painting, onClose }) {
    return (
        <div className="modal fade show" tabIndex="-1" role="dialog" aria-labelledby="authorModalLabel"
             aria-hidden="true"
             style={{display: 'block'}}>
            <div className="modal-dialog modal-fullscreen" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="authorModalLabel">{painting.title}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"
                                onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-4 text-center">
                                <img id="profile-image" src={painting.Image} alt={painting.title}
                                     className="img-fluid" style={{width: 'auto', height: 'auto'}}/>
                            </div>
                            <div className="col-md-8">
                                <h4>Інформація про картину</h4>
                                <div style={{maxHeight: '1000px'}}>
                                    <p>{painting.Description}</p>
                                    <p>{`${painting.author_name} ${painting.author_surname}`}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaintingDetailsModal;
