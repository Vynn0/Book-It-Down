import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton
} from '@mui/material'
import { Person, Menu as MenuIcon } from '@mui/icons-material'
import { SessionIndicator } from '../../security'

interface NavbarProps {
  title: string;
  onBack: () => void;
  userRole?: 'employee' | 'administrator';
  onProfileClick?: () => void;
  onMenuClick: () => void; // Prop baru
}

function Navbar({ title, onProfileClick, onMenuClick }: NavbarProps) {
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

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SessionIndicator compact={true} />
          {onProfileClick && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Person />}
              onClick={onProfileClick}
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
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
