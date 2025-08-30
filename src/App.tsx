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
import SearchPage from './pages/Employee/SearchPage'

// Impor logo
import viorenLogo from './assets/vioren-logo.png'

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
  const [currentPage, setCurrentPage] = useState<'login' | 'search'>('login')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login attempt:', { email, password })
    // For demo purposes, just navigate to search page
    setCurrentPage('search')
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #3C355F 0%, #FF9B0F 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
        }}
      >
        <Container maxWidth="sm">
          <Card
            sx={{
              maxWidth: 400,
              mx: 'auto',
              borderRadius: 3,
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
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
                  }}
                >
                  Login
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
