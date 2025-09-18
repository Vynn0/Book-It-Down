import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton
} from '@mui/material'
import { Person, Menu as MenuIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { SessionIndicator } from '../../security'
import { useAuth } from '../../hooks'

interface NavbarProps {
  title: string;
  onBack?: () => void; // Make optional since we can use router
  userRole?: 'employee' | 'administrator';
  onProfileClick?: () => void; // Keep optional for backward compatibility
  onMenuClick: () => void;
}

function Navbar({ title, onProfileClick, onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Handle profile navigation - use prop if provided, otherwise use router
  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else if (user?.userID) {
      navigate(`/profile/${user.userID}`);
    } else {
      navigate('/profile');
    }
  };
  return (
    <AppBar position="static" color="secondary">
      <Toolbar>
        {/* Tombol Hamburger */}
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={onMenuClick}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SessionIndicator compact={true} />
          <Button
            variant="outlined"
            size="small"
            startIcon={<Person />}
            onClick={handleProfileClick}
            sx={{
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: 'white'
              }
            }}
          >
            Profile
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
