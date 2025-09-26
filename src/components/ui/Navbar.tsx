import { useState } from 'react'; 
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,         
  MenuItem,     
  Avatar,       
  ListItemIcon, 
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout,         
  AccountCircle,  
} from '@mui/icons-material';
import { SessionIndicator } from '../../security';
import { useNavigation, useAuth } from '../../hooks';  useAuth

interface NavbarProps {
  title: string;
  // onProfileClick?: () => void;
  onMenuClick: () => void;
}

function Navbar({ title, onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth(); // <-- Panggil hook useAuth
  const { goToProfile, goToLogin } = useNavigation();

  // State untuk mengelola dropdown menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    goToProfile();
    handleClose();
  };

  const handleLogout = () => {
    logout();
    goToLogin();
    handleClose();
  };
  
  // Fungsi untuk mendapatkan inisial nama
  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };


  return (
    <AppBar position="static" color="secondary">
      <Toolbar>
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

          {/* === GANTI BAGIAN INI === */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ mr: 1.5, display: { xs: 'none', sm: 'block' } }}>
              {user?.name || 'User'}
            </Typography>
            <IconButton
              onClick={handleMenu}
              sx={{ p: 0 }}
            >
              <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                {getInitials(user?.name)}
              </Avatar>
            </IconButton>
          </Box>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={open}
            onClose={handleClose}
            sx={{ mt: '45px' }}
          >
            <MenuItem onClick={handleProfileClick}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
               <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
          {/* === AKHIR BAGIAN PENGGANTIAN === */}

        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;