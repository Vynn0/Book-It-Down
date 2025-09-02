import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Chip,
  Button
} from '@mui/material'
import { ArrowBack, Person, Logout } from '@mui/icons-material'
import { useAuth } from '../../hooks/useAuth'

interface NavbarProps {
  title: string
  onBack: () => void
  userRole?: 'employee' | 'administrator'
}

function Navbar({ title, onBack, userRole = 'employee' }: NavbarProps) {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    onBack() // This will redirect to login
  }
  return (
    <AppBar position="static" color="secondary">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          onClick={onBack}
          sx={{ mr: 2 }}
          aria-label="go back"
        >
          <ArrowBack />
        </IconButton>
        
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
