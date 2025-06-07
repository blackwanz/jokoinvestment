import React from 'react';

function PhotoModal({ photo, onClose }) {
  if (!photo) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={photo.url} alt="foto" />
        <p>{photo.deskripsi}</p>
        <img
          src="/qris.png"
          alt="Donasi via QRIS"
          style={{ width: '200px', marginTop: '10px' }}
        />
        <button onClick={onClose} style={{ marginTop: '10px' }}>
          Tutup
        </button>
      </div>
    </div>
  );
}

export default PhotoModal;
