import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  // Check if we're in a router context by trying to get navigate function
  let navigate: ((path: string) => void) | null = null;
  let isRouterContext = false;
  
  try {
    navigate = useNavigate();
    isRouterContext = true;
  } catch (error) {
    // Not in router context, use state-based navigation
    isRouterContext = false;
  }

  const getInitialPage = (): 'login' | 'search' | 'admin' | 'profile' | 'roomManagement' => {
    const session = SessionManager.getSession();
    const storedUser = localStorage.getItem('authenticated_user');

    if (session && SessionManager.isSessionValid() && storedUser) {
      return (session.currentPage as 'login' | 'search' | 'admin' | 'profile' | 'roomManagement') || 'search';
    }
    return 'login';
  };

  const [currentPage, setCurrentPage] = useState<'login' | 'search' | 'admin' | 'profile' | 'roomManagement'>(getInitialPage)
  // Perubahan: Tambahkan state untuk activeView
  const [initialActiveView, setInitialActiveView] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { login, isLoading, isAuthenticated } = useAuth()
  const { notification, showNotification, hideNotification } = useNotification()

  useEffect(() => {
    const session = SessionManager.getSession();
    if (isAuthenticated && session && SessionManager.isSessionValid()) {
      const sessionPage = session.currentPage || 'search';
      if (sessionPage !== currentPage) {
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

    if (result.success && result.user) {
      showNotification(result.message, 'success')
      
      const isAdmin = result.user.roles.some(role => role.role_id === 1);
      const isRoomManager = result.user.roles.some(role => role.role_id === 2);

      if (isRouterContext && navigate) {
        // Use router navigation
        if (isAdmin) {
          SessionManager.updateCurrentPage('admin');
          navigate('/admin/dashboard');
        } else if (isRoomManager) {
          SessionManager.updateCurrentPage('roomManagement');
          navigate('/rooms/management');
        } else {
          SessionManager.updateCurrentPage('search');
          navigate('/searchpage');
        }
      } else {
        // Use state-based navigation (fallback)
        if (isAdmin) {
          setCurrentPage('admin');
          SessionManager.updateCurrentPage('admin');
        } else if (isRoomManager) {
          setCurrentPage('roomManagement');
          SessionManager.updateCurrentPage('roomManagement');
        } else {
          setCurrentPage('search');
          SessionManager.updateCurrentPage('search');
        }
      }
    } else {
      showNotification(result.message, 'error')
    }
  }
  // Fungsi navigasi yang lebih umum
  const handleNavigate = (page: 'login' | 'search' | 'admin' | 'profile' | 'roomManagement', activeView?: string) => {
    setInitialActiveView(activeView);
    setCurrentPage(page);
    SessionManager.updateCurrentPage(page);
  };
  
  const handleBackToLogin = () => {
    setCurrentPage('login')
    SessionManager.updateCurrentPage('login')
    setEmail('')
    setPassword('')
  }

  // In router context, only handle login. Other pages are handled by separate routes.
  if (isRouterContext) {
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
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              bgcolor: 'rgba(0,0,0,0.7)',
              zIndex: 1,
            }}
          />
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

  // State-based navigation (original behavior)
  if (isAuthenticated) {
    switch (currentPage) {
      case 'search':
        return <SearchPage 
          onBack={handleBackToLogin} 
          onProfileClick={() => handleNavigate('profile')} 
          onNavigateToAdmin={() => handleNavigate('admin')} 
          onNavigateToRoomManagement={() => handleNavigate('roomManagement')} 
          initialActiveView={initialActiveView} 
        />;
      case 'profile':
        return <Profile onBack={() => handleNavigate('search')} />;
      case 'admin':
        return <AdminDashboard 
          onBack={handleBackToLogin} 
          onProfileClick={() => handleNavigate('profile')} 
          onNavigateToSearch={() => handleNavigate('search', 'addBooking')}
          // Tambahkan navigasi ke Room Management
          onNavigateToRoomManagement={() => handleNavigate('roomManagement')}
        />;
      case 'roomManagement':
        return <RoomManagement 
          onBack={() => handleNavigate('search')} 
          onProfileClick={() => handleNavigate('profile')} 
          onNavigateToSearch={() => handleNavigate('search', 'addBooking')}
          // Tambahkan navigasi kembali ke Admin Dashboard
          onNavigateToAdmin={() => handleNavigate('admin')}
        />;
      default:
        // Jika karena suatu hal halaman tidak valid, kembali ke search
        handleNavigate('search');
        return null;
    }
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
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0,0,0,0.7)',
            zIndex: 1,
          }}
        />
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