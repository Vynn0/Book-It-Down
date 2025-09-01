import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Chip
} from '@mui/material'
import { ArrowBack, Person } from '@mui/icons-material'

interface NavbarProps {
  title: string
  onBack: () => void
  userRole?: 'employee' | 'administrator'
}

function Navbar({ title, onBack, userRole = 'employee' }: NavbarProps) {
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
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
