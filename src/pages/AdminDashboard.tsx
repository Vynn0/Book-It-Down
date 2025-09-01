import { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Snackbar,
  CssBaseline,
  CircularProgress,
  Divider
} from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { PersonAdd, Visibility, VisibilityOff } from '@mui/icons-material'
import { InputAdornment, IconButton } from '@mui/material'
import { Navbar } from '../components/ui'
import { supabase } from '../utils/supabase'
import bcrypt from 'bcryptjs'

// Same theme as other pages
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

interface AdminDashboardProps {
  onBack: () => void
}

interface UserForm {
  name: string
  email: string
  password: string
}

function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [userForm, setUserForm] = useState<UserForm>({
    name: '',
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  const handleInputChange = (field: keyof UserForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserForm(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const validateForm = (): string | null => {
    if (!userForm.name.trim()) return 'Name is required'
    if (!userForm.email.trim()) return 'Email is required'
    if (!userForm.password.trim()) return 'Password is required'
    if (userForm.password.length < 6) return 'Password must be at least 6 characters'
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userForm.email)) return 'Please enter a valid email address'
    
    return null
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setSnackbar({
        open: true,
        message: validationError,
        severity: 'error'
      })
      return
    }

    setIsLoading(true)

    try {
      // Hash the password using bcrypt
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(userForm.password, saltRounds)

      // Insert user into Supabase
      const { error } = await supabase
        .from('user')
        .insert([
          {
            name: userForm.name.trim(),
            email: userForm.email.trim().toLowerCase(),
            password: hashedPassword,
            created_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) {
        throw error
      }

      setSnackbar({
        open: true,
        message: `User "${userForm.name}" added successfully!`,
        severity: 'success'
      })

      // Reset form
      setUserForm({ name: '', email: '', password: '' })

    } catch (error: any) {
      console.error('Error adding user:', error)
      setSnackbar({
        open: true,
        message: error.message || 'Failed to add user. Please try again.',
        severity: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <Navbar 
          title="Admin Dashboard - User Management" 
          onBack={onBack}
          userRole="administrator"
        />

        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonAdd sx={{ mr: 2, color: 'secondary.main' }} />
                <Typography variant="h4" component="h1" color="secondary">
                  Add New User
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" mb={3}>
                Create a new user account with encrypted password. This is a developer tool for quick user addition.
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Box component="form" onSubmit={handleAddUser}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={userForm.name}
                  onChange={handleInputChange('name')}
                  required
                  margin="normal"
                  placeholder="Enter user's full name"
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  type="email"
                  label="Email Address"
                  value={userForm.email}
                  onChange={handleInputChange('email')}
                  required
                  margin="normal"
                  placeholder="Enter user's email"
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  value={userForm.password}
                  onChange={handleInputChange('password')}
                  required
                  margin="normal"
                  placeholder="Enter secure password (min 6 characters)"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
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
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <PersonAdd />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                  }}
                >
                  {isLoading ? 'Adding User...' : 'Add User'}
                </Button>
              </Box>

              <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Security Note:</strong> Passwords are automatically hashed using bcrypt with 12 salt rounds before storage.
                  The created_at timestamp is automatically set to the current time.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  )
}

export default AdminDashboard
