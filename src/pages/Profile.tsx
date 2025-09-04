import React from 'react';
import { Box } from '@mui/material';
import SideAdminProfile from '../components/ui/Admin/SideAdminProfile';
import SideEmployeeProfile from '../components/ui/Employee/SideEmployeeProfile';
import { useAdminProfile } from '../hooks/useAdminProfile';
import { useRoleBasedRouting } from '../hooks';

interface ProfileProps {
  onBack?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onBack }) => {
  const { getRoleBasedView, isAdmin } = useRoleBasedRouting();
  const { 
    userData, 
    loading, 
    error,
    handleProfileClick,
    handleRiwayatClick,
    handleLogoutClick,
  } = useAdminProfile();

  // Show loading state for admin users
  if (isAdmin() && loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Memuat data...</p>
      </div>
    );
  }

  // Show error state for admin users
  if (isAdmin() && error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <p>{error}</p>
      </div>
    );
  }

  const renderRoleBasedProfile = () => {
    const roleView = getRoleBasedView();
    
    switch (roleView) {
      case 'admin':
        return (
          <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Top Navigation Bar */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '60px',
                backgroundColor: '#3f51b5',
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
              }}
            >
              <div style={{ fontSize: '24px', color: 'white', cursor: 'pointer' }} onClick={onBack}>
                &#x25C0;
              </div>
            </div>

            {/* Konten Utama (Sidebar dan Profile Content) */}
            <div style={{ display: 'flex', flexGrow: 1, marginTop: '60px' }}>
              <SideAdminProfile
                onProfileClick={handleProfileClick}
                onRiwayatClick={handleRiwayatClick}
                onLogoutClick={handleLogoutClick}
              />

              <div
                style={{
                  flexGrow: 1,
                  padding: '40px',
                  backgroundColor: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  overflowY: 'auto',
                }}
              >
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: '#a23b3b',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '36px',
                    fontWeight: 'bold',
                    marginBottom: '30px',
                  }}
                >
                  {userData?.initials}
                </div>

                <div style={{ width: '100%', maxWidth: '500px' }}>
                  <label style={{ fontSize: '16px', fontWeight: 'bold', color: '#555', marginBottom: '8px', display: 'block' }}>
                    Nama User
                  </label>
                  <input
                    type="text"
                    value={userData?.namaUser}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '12px',
                      marginBottom: '20px',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      backgroundColor: '#f0f0f0',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      color: '#333'
                    }}
                  />

                  <label style={{ fontSize: '16px', fontWeight: 'bold', color: '#555', marginBottom: '8px', display: 'block' }}>
                    Role
                  </label>
                  <input
                    type="text"
                    value={userData?.role}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '12px',
                      marginBottom: '20px',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      backgroundColor: '#f0f0f0',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      color: '#333'
                    }}
                  />

                  <label style={{ fontSize: '16px', fontWeight: 'bold', color: '#555', marginBottom: '8px', display: 'block' }}>
                    NIK
                  </label>
                  <input
                    type="text"
                    value={userData?.nik}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '12px',
                      marginBottom: '20px',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      backgroundColor: '#f0f0f0',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      color: '#333'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'room-manager':
      case 'employee':
      default:
        return (
          <Box sx={{ 
            minHeight: '100vh', 
            bgcolor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <SideEmployeeProfile onBack={onBack} />
          </Box>
        );
    }
  };

  return renderRoleBasedProfile();
};

export default Profile;
