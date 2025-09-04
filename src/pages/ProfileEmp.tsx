import React from 'react';
import { Box } from '@mui/material';
import SideEmployeeProfile from '../components/ui/Employee/SideEmployeeProfile';

interface ProfileEmpProps {
  onBack?: () => void;
}

const ProfileEmp: React.FC<ProfileEmpProps> = ({ onBack }) => {
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
};

export default ProfileEmp;