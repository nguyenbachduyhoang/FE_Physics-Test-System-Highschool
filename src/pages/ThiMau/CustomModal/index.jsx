import React from "react";
import "./index.scss";

const CustomModal = ({ open, onClose, title, subject, children }) => {
  if (!open) return null;
  return (
    <div className="my-modal-overlay" onClick={onClose}>
      <div className="my-modal-content" onClick={e => e.stopPropagation()}>
        <div className="my-modal-header">
          <div className="my-modal-title-group">
            <h2>{title}</h2>
            {subject && <div className="my-modal-subject">{subject}</div>}
          </div>
          <button className="my-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="my-modal-body">{children}</div>
      </div>
    </div>
  );
};

export default CustomModal;
