import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CssBaseline,
  Divider
} from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { PersonAdd } from '@mui/icons-material'
import { Navbar, NotificationComponent } from '../components/ui'
import { UserFormComponent } from '../components/auth'
import { useUserManagement, useNotification } from '../hooks'

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

function AdminDashboard({ onBack }: AdminDashboardProps) {
  const {
    userForm,
    isLoading,
    updateUserForm,
    resetForm,
    addUser,
    validateForm
  } = useUserManagement()

  const {
    notification,
    showNotification,
    hideNotification
  } = useNotification()

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm(userForm)
    if (validationError) {
      showNotification(validationError, 'error')
      return
    }

    const result = await addUser(userForm)
    
    if (result.success) {
      showNotification(result.message, 'success')
      resetForm()
    } else {
      showNotification(result.message, 'error')
    }
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

              <UserFormComponent
                userForm={userForm}
                isLoading={isLoading}
                onInputChange={updateUserForm}
                onSubmit={handleAddUser}
                submitButtonText="Add User"
              />

              <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Security Note:</strong> Passwords are automatically hashed using bcrypt with 12 salt rounds before storage.
                  The created_at timestamp is automatically set to the current time.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>

        <NotificationComponent
          notification={notification}
          onClose={hideNotification}
        />
      </Box>
    </ThemeProvider>
  )
}

export default AdminDashboard
