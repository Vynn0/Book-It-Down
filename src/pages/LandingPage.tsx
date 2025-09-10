import { useState, useEffect } from 'react'
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
import SearchPage from './SearchPage'
import AdminDashboard from './AdminDashboard'
import RoomManagement from './RoomManagement'
import Profile from './Profile'
import { NotificationComponent } from '../components/ui'
import {
  useAuth,
  useNotification
} from '../hooks'
import { SessionManager } from '../security/sessionManager'
import { appTheme } from '../services'
import viorenLogo from '../assets/vioren-logo.png'
import backgroundImage from '../assets/landing-page.jpg'

function App() {
  // Initialize currentPage based on existing session AND auth state
  const getInitialPage = (): 'login' | 'search' | 'admin' | 'profile' | 'roomManagement' => {
    // Check session first
    const session = SessionManager.getSession();
    const storedUser = localStorage.getItem('authenticated_user');

    if (session && SessionManager.isSessionValid() && storedUser) {
      console.log(`Restoring page from session: ${session.currentPage}`);
      return (session.currentPage as 'login' | 'search' | 'admin' | 'profile' | 'roomManagement') || 'search';
    }
    return 'login';
  };

  const [currentPage, setCurrentPage] = useState<'login' | 'search' | 'admin' | 'profile' | 'roomManagement'>(getInitialPage)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { login, isLoading, isAuthenticated } = useAuth()
  const { notification, showNotification, hideNotification } = useNotification()

  // Sync currentPage with session on auth state changes
  useEffect(() => {
    const session = SessionManager.getSession();
    if (isAuthenticated && session && SessionManager.isSessionValid()) {
      const sessionPage = session.currentPage || 'search';
      if (sessionPage !== currentPage) {
        console.log(`Syncing page state: ${currentPage} → ${sessionPage}`);
        setCurrentPage(sessionPage as 'login' | 'search' | 'admin' | 'profile');
      }
    }
  }, [isAuthenticated, currentPage]);

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
      SessionManager.updateCurrentPage('search')
    } else {
      showNotification(result.message, 'error')
    }
  }

  const handleBackToLogin = () => {
    setCurrentPage('login')
    SessionManager.updateCurrentPage('login')
    setEmail('')
    setPassword('')
  }

  const handleProfileNavigation = () => {
    const session = SessionManager.getSession();
    // If session has 'roomManagement' as currentPage, navigate there
    if (session && session.currentPage === 'roomManagement') {
      setCurrentPage('roomManagement');
    } else {
      setCurrentPage('profile');
      SessionManager.updateCurrentPage('profile');
    }
  }

  const handleBackToSearch = () => {
    setCurrentPage('search')
    SessionManager.updateCurrentPage('search')
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

  // Show Room Management
  if (currentPage === 'roomManagement') {
    return <RoomManagement onBack={handleBackToSearch} />
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
                  {/* Textfield email */}
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

                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
