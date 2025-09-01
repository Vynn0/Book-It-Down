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
  InputAdornment
} from '@mui/material'
import { Email, Lock } from '@mui/icons-material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import SearchPage from './SearchPage'
import AdminDashboard from './AdminDashboard'
import viorenLogo from '../assets/vioren-logo.png'
import backgroundImage from '../assets/landing-page.jpg'

// Custom theme with your color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF9B0F', // Orange
    },
    secondary: {
      main: '#3C355F', // Purple
    },
  },
})

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [currentPage, setCurrentPage] = useState<'login' | 'search' | 'admin'>('login')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login attempt:', { email, password })
    // For demo purposes, just navigate to search page
    setCurrentPage('search')
  }

  const handleAdminAccess = () => {
    // Direct access to admin dashboard for developers
    setCurrentPage('admin')
  }

  const handleBackToLogin = () => {
    setCurrentPage('login')
    setEmail('')
    setPassword('')
  }

  // Show SearchPage if logged in
  if (currentPage === 'search') {
    return <SearchPage onBack={handleBackToLogin} />
  }

  // Show AdminDashboard
  if (currentPage === 'admin') {
    return <AdminDashboard onBack={handleBackToLogin} />
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          padding: 2,
          backgroundImage: backgroundImage, // Path ke gambar Anda
          backgroundSize: 'cover', // Pastikan gambar menutupi seluruh area
          backgroundPosition: 'center', // Pusatkan gambar
          backgroundRepeat: 'no-repeat', // Jangan ulangi gambar
          minHeight: '100vh', // Pastikan background terlihat penuh di viewport
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white', // Pastikan teks tetap terlihat di atas background gelap
          textShadow: '2px 2px 4px rgba(0,0,0,0.7)', // Tambahkan shadow agar teks lebih jelas
      
        }}
      >
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
                color="secondary"
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
                mb={4}
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
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    color: 'white',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  Login
                </Button>
                
                {/* Developer Access Button */}
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={handleAdminAccess}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderColor: 'secondary.main',
                    color: 'secondary.main',
                    '&:hover': {
                      backgroundColor: 'secondary.main',
                      color: 'white'
                    }
                  }}
                >
                  🔧 Developer: Admin Dashboard
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
