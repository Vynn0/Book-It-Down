import { useState, useEffect } from 'react';

// Tipe data untuk profile pengguna
interface UserProfile {
  initials: string;
  namaUser: string;
  role: string;
  nik: string;
}

// Tipe data yang akan dikembalikan oleh hook
interface UseAdminProfileResult {
  userData: UserProfile | null;
  loading: boolean;
  error: string | null;
  handleProfileClick: () => void;
  handleRiwayatClick: () => void;
  handleLogoutClick: () => void;
}

const DUMMY_USER_DATA: UserProfile = {
  initials: 'MK',
  namaUser: 'Nama Admin Lengkap',
  role: 'Administrator',
  nik: '1234567890123456',
};

export const useAdminProfile = (): UseAdminProfileResult => {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = setTimeout(() => {
      // Tidak perlu try...catch karena tidak ada operasi yang bisa melempar error di sini
      // Kita langsung set data dan loading.
      setUserData(DUMMY_USER_DATA);
      setLoading(false);
      setError(null); // Atur error menjadi null setelah berhasil
    }, 1000);

    return () => clearTimeout(fetchUserData);
  }, []);

  const handleProfileClick = () => {
    alert('Anda sudah di halaman Profile!');
  };

  const handleRiwayatClick = () => {
    alert('Navigasi ke halaman Riwayat...');
  };

  const handleLogoutClick = () => {
    alert('Melakukan Logout...');
  };

  return {
    userData,
    loading,
    error,
    handleProfileClick,
    handleRiwayatClick,
    handleLogoutClick,
  };
};