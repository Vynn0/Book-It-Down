// Tanpa tombol "Book"
import React from 'react';
// import './LeftPanel.css';

const LeftPanel: React.FC = () => {
  return (
    <div className="left-panel-container">
      <div className="image-carousel">
        <div className="carousel-placeholder">
          <div className="arrow left-arrow">{'<'}</div>
          <div className="image-box"></div>
          <div className="arrow right-arrow">{'>'}</div>
        </div>
      </div>

      <div className="room-details">
        <h2>Room Name</h2>
        <div className="details-list">
          <p><strong>Jumlah Orang:</strong></p>
          <p><strong>Tanggal:</strong></p>
          <p><strong>Mulai:</strong></p>
          <p><strong>Selesai:</strong></p>
          <p><strong>Keterangan:</strong></p>
        </div>
      </div>
    </div>
  );
};

export default LeftPanel;