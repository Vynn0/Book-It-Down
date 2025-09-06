import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  CssBaseline,
  InputAdornment,
  CircularProgress
} from '@mui/material'
import { Email, Lock } from '@mui/icons-material'
import { ThemeProvider } from '@mui/material/styles'
import SearchPage from './HomePage'
import AdminDashboard from './AdminDashboard'
import Profile from './Profile'
import { NotificationComponent } from '../components/ui'
import { 
  useAuth, 
  useNotification
} from '../hooks'
import { appTheme } from '../services'
import viorenLogo from '../assets/vioren-logo.png'
import backgroundImage from '../assets/landing-page.jpg'

function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'search' | 'admin' | 'profile'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const { login, isLoading, isAuthenticated } = useAuth()
  const { notification, showNotification, hideNotification } = useNotification()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !password.trim()) {
      showNotification('Please enter both email and password', 'error')
      return
    }

    const result = await login(email, password)
    
    if (result.success) {
      showNotification(result.message, 'success')
      setCurrentPage('search')
    } else {
      showNotification(result.message, 'error')
    }
  }

  const handleBackToLogin = () => {
    setCurrentPage('login')
    setEmail('')
    setPassword('')
  }

  const handleProfileNavigation = () => {
    setCurrentPage('profile')
  }

  const handleBackToSearch = () => {
    setCurrentPage('search')
  }

  // If authenticated and trying to access protected pages
  if (isAuthenticated && currentPage === 'search') {
    return <SearchPage onBack={handleBackToLogin} onProfileClick={handleProfileNavigation} />
  }

  // Show Profile page based on user role
  if (isAuthenticated && currentPage === 'profile') {
    return <Profile onBack={handleBackToSearch} />
  }

  // Show AdminDashboard
  if (currentPage === 'admin') {
    return <AdminDashboard onBack={handleBackToLogin} onProfileClick={handleProfileNavigation} />
  }

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay transparan */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0,0,0,0.7)', // Ubah alpha untuk transparansi
            zIndex: 1,
          }}
        />
        {/* Konten utama */}
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Container maxWidth="sm">
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                 <img
                   src={viorenLogo}
                   alt="Vioren Logo"
                   style={{ maxWidth: '100px', height: 'auto' }}
                 />
               </Box>
               <Typography
                  variant="h4"
                  component="h1"
                  align="center"
                  color="white"
                  fontWeight="600"
                  mb={4}
                >
                  Book It Down
                </Typography>
            <Card
              sx={{
                maxWidth: 700,
                mx: 'auto',
                borderRadius: 3,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h4"
                  component="h1"
                  align="center"
                  color="secondary"
                  fontWeight="300"
                  mb={2}
                >
                  Login
                </Typography>
                
                <Box component="form" onSubmit={handleLogin}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    fullWidth
                    type="password"
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 3 }}
                  />
                
                <Box sx={{ display: 'flex', justifyContent: 'center'}}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      width: '50%',
                      fontSize: '1.1rem',
                      color: 'white',
                      fontWeight: 600,
                      mb: 2
                    }}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </Box>
                </Box>
              </CardContent>
            </Card>
          </Container>

          <NotificationComponent
            notification={notification}
            onClose={hideNotification}
          />
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
