import { Box } from '@mui/material';
import SideEmployeeProfile from '../components/ui/Employee/SideEmployeeProfile';

const ProfileEmp = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <SideEmployeeProfile />
    </Box>
  );
};

export default ProfileEmp;