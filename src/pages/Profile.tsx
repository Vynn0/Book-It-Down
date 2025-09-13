import React, { useState } from 'react';
import SideProfile from '../components/ui/SideProfile';
import { useAuth } from '../hooks/useAuth';
import { SessionManager } from '../security/sessionManager';

interface ProfileProps {
  onBack?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onBack }) => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<'profile' | 'riwayat'>('profile');

  const handleProfileClick = () => {
    console.log('Profile clicked');
    setCurrentView('profile');
  };

  const handleRiwayatClick = () => {
    console.log('Riwayat clicked');
    setCurrentView('riwayat');
  };

  const handleLogoutClick = () => {
    console.log('Logout clicked');
    logout();
    if (onBack) {
      onBack();
    }
  };

  const handleBackClick = () => {
    console.log('Back button clicked');
    // Update session to go back to search page
    SessionManager.updateCurrentPage('search');
    if (onBack) {
      onBack();
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Get user roles as a string
  const getUserRoles = () => {
    if (!user?.roles || user.roles.length === 0) return 'No role assigned';
    return user.roles.map(role => role.role_name).join(', ');
  };

  const renderMainContent = () => {
    if (currentView === 'profile') {
      return (
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
          {/* User Avatar */}
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: '#3f51b5',
              color: 'white',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '36px',
              fontWeight: 'bold',
              marginBottom: '30px',
            }}
          >
            {getUserInitials()}
          </div>

          {/* User Information Form */}
          <div style={{ width: '100%', maxWidth: '500px' }}>
            <label style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: '#555', 
              marginBottom: '8px', 
              display: 'block' 
            }}>
              Full Name
            </label>
            <input
              type="text"
              value={user?.name || 'N/A'}
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

            <label style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: '#555', 
              marginBottom: '8px', 
              display: 'block' 
            }}>
              Email
            </label>
            <input
              type="email"
              value={user?.email || 'N/A'}
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

            <label style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: '#555', 
              marginBottom: '8px', 
              display: 'block' 
            }}>
              Role(s)
            </label>
            <input
              type="text"
              value={getUserRoles()}
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

            <label style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: '#555', 
              marginBottom: '8px', 
              display: 'block' 
            }}>
              User ID
            </label>
            <input
              type="text"
              value={user?.userID || 'N/A'}
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

            <label style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: '#555', 
              marginBottom: '8px', 
              display: 'block' 
            }}>
              Account Created
            </label>
            <input
              type="text"
              value={user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'N/A'}
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
      );
    } else if (currentView === 'riwayat') {
      return (
        <div
          style={{
            flexGrow: 1,
            padding: '40px',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflowY: 'auto',
          }}
        >
          <h1 style={{ color: '#333', marginBottom: '20px' }}>Riwayat</h1>
          <p style={{ color: '#666', textAlign: 'center', maxWidth: '500px' }}>
            History/Riwayat functionality will be implemented here.
          </p>
        </div>
      );
    }
  };

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
        <div style={{ fontSize: '24px', color: 'white', cursor: 'pointer' }} onClick={handleBackClick}>
          &#x25C0;
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div style={{ display: 'flex', flexGrow: 1, marginTop: '60px' }}>
        <SideProfile
          onProfileClick={handleProfileClick}
          onRiwayatClick={handleRiwayatClick}
          onLogoutClick={handleLogoutClick}
        />

        {renderMainContent()}
      </div>
    </div>
  );
};

export default Profile;
