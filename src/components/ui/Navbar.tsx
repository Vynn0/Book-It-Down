import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Chip,
  Button
} from '@mui/material'
import { Person, Logout } from '@mui/icons-material'
import { useAuth } from '../../hooks/useAuth'

interface NavbarProps {
  title: string
  onBack: () => void
  userRole?: 'employee' | 'administrator'
  onProfileClick?: () => void
}

function Navbar({ title, onBack, userRole = 'employee', onProfileClick }: NavbarProps) {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    onBack() // This will redirect to login
  }
  return (
    <AppBar position="static" color="secondary">
      <Toolbar>
        {/* <IconButton
          edge="start"
          color="inherit"
          onClick={onBack}
          sx={{ mr: 2 }}
          aria-label="go back"
        >
          <ArrowBack />
        </IconButton> */}
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<Person />}
            label={userRole === 'administrator' ? 'Admin' : 'Employee'}
            color={userRole === 'administrator' ? 'warning' : 'primary'}
            variant="outlined"
            sx={{ 
              color: 'white',
              borderColor: 'white',
              '& .MuiChip-icon': { color: 'white' }
            }}
          />
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
          {user && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Logout />}
              onClick={handleLogout}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white'
                }
              }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
