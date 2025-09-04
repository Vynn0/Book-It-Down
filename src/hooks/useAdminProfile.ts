import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

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

export const useAdminProfile = (): UseAdminProfileResult => {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useAuth();

  const getInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const getRoleDisplayName = (): string => {
    if (!user?.roles) return 'Unknown Role';
    
    // Check if user has admin role (role_id: 1)
    const hasAdminRole = user.roles.some(role => role.role_id === 1);
    if (hasAdminRole) return 'Administrator';
    
    // Check if user has room manager role (role_id: 2)
    const hasRoomManagerRole = user.roles.some(role => role.role_id === 2);
    if (hasRoomManagerRole) return 'Room Manager';
    
    // Default to Employee
    return 'Employee';
  };

  useEffect(() => {
    if (user) {
      setUserData({
        initials: getInitials(user.name),
        namaUser: user.name,
        role: getRoleDisplayName(),
        nik: user.userID, // Using userID as NIK for now
      });
      setLoading(false);
      setError(null);
    } else {
      setError('User not found');
      setLoading(false);
    }
  }, [user]);

  const handleProfileClick = () => {
    alert('Anda sudah di halaman Profile!');
  };

  const handleRiwayatClick = () => {
    alert('Navigasi ke halaman Riwayat...');
  };

  const handleLogoutClick = () => {
    const confirmed = window.confirm('Apakah Anda yakin ingin keluar?');
    if (confirmed) {
      logout();
    }
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