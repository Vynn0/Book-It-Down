import React, { useState } from 'react';
import LeftPanel from './LeftPanel';
import Calendar from './Calendar';
import Modal from './Modal'; // Import komponen Modal
import './BookRoom.css';

const BookRoom: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="book-room-page">
      {/* Tampilan halaman utama yang mungkin berisi tombol untuk membuka modal */}
      <h1>Halaman Utama Pemesanan Ruangan</h1>
      <button className="open-modal-button" onClick={handleOpenModal}>
        Pesan Ruangan
      </button>

      {/* Komponen Modal yang akan menampilkan LeftPanel dan Calendar */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="modal-content-layout">
          <LeftPanel />
          <Calendar />
        </div>
      </Modal>
    </div>
  );
};

export default BookRoom;