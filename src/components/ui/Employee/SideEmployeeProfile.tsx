import React from 'react';
import { Box, Typography, Button, Card, CardContent, Avatar } from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';
import { useRoleBasedRouting } from '../../../hooks/useRoleBasedRouting';

interface SideEmployeeProfileProps {
  onBack?: () => void;
}

const SideEmployeeProfile: React.FC<SideEmployeeProfileProps> = ({ onBack }) => {
  const { logout, user } = useAuth();
  const { getRoleBasedView } = useRoleBasedRouting();

  const handleLogout = () => {
    const confirmed = window.confirm("Apakah Anda yakin ingin keluar?");
    if (confirmed) {
      console.log("User logged out");
      logout();
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return parts[0][0];
  };

  const getRoleDisplayName = () => {
    const roleView = getRoleBasedView();
    switch (roleView) {
      case 'admin':
        return 'Administrator';
      case 'room-manager':
        return 'Room Manager';
      case 'employee':
        return 'Employee';
      default:
        return 'Unknown Role';
    }
  };

  if (!user) {
    return (
      <Card sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
        <CardContent>
          <Typography variant="body1" color="error" align="center">
            User not logged in
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 3,
          }}
        >
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: 'grey.600',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              mb: 2,
            }}
          >
            {getInitials(user.name)}
          </Avatar>
          
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            {user.name}
          </Typography>
          
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {getRoleDisplayName()}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {user.email}
          </Typography>
          
          {onBack && (
            <Button
              variant="outlined"
              onClick={onBack}
              sx={{
                width: '80%',
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                mb: 2,
              }}
            >
              Back to Search
            </Button>
          )}
          
          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            sx={{
              width: '80%',
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
            }}
          >
            Logout
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SideEmployeeProfile;