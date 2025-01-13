import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div
            className="modal fade show d-flex align-items-center justify-content-center"
            style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            tabIndex="-1"
            role="dialog"
        >
            <div className="modal-dialog" role="document">
                <div className="modal-content">

                    <div className="modal-body">{children}</div>
                 
                </div>
            </div>
        </div>
    );
};

export default Modal;
