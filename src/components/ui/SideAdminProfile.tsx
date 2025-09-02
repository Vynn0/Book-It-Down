import React from 'react';

// Props type untuk komponen, mendefinisikan fungsi yang akan dijalankan saat tombol diklik.
interface SideAdminProfileProps {
  onProfileClick: () => void;
  onRiwayatClick: () => void;
  onLogoutClick: () => void;
}

const SideAdminProfile: React.FC<SideAdminProfileProps> = ({ 
  onProfileClick, 
  onRiwayatClick, 
  onLogoutClick 
}) => {
  return (
    <div
      style={{
        width: '300px', // Lebar sidebar
        height: '100vh', // Tinggi penuh viewport
        backgroundColor: '#e0e0e0', // Warna latar belakang abu-abu muda
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px', // Jarak vertikal antar tombol
        }}
      >
        <button
          onClick={onProfileClick}
          style={{
            padding: '15px 20px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Profile
        </button>

        <button
          onClick={onRiwayatClick}
          style={{
            padding: '15px 20px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Riwayat
        </button>

        <button
          onClick={onLogoutClick}
          style={{
            padding: '15px 20px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#ff4c4c', // Warna merah untuk tombol Logout
            color: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SideAdminProfile;