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
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
