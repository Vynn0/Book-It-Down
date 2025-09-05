import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CssBaseline,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { appTheme } from '../services'
import { PersonAdd, Add, ArrowBack } from '@mui/icons-material'
import { Navbar, NotificationComponent } from '../components/ui'
import { UserFormComponent } from '../components/auth'
import { useUserManagement, useNotification } from '../hooks'
import { supabase } from '../utils/supabase'
import { useState, useEffect } from 'react'

interface AdminDashboardProps {
  onBack: () => void
  onProfileClick?: () => void
}

interface DatabaseUser {
  user_id: string
  name: string
  email: string
  created_at: string
  roles?: Array<{
    role_id: number
    role_name: string
  }>
}

function AdminDashboard({ onBack, onProfileClick }: AdminDashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [users, setUsers] = useState<DatabaseUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)
  
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

  // Fetch users from database
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true)
      setUsersError(null)

      // Fetch users with their roles
      const { data: usersData, error: usersError } = await supabase
        .from('user')
        .select(`
          user_id,
          name,
          email,
          created_at
        `)
        .order('created_at', { ascending: false })

      if (usersError) {
        throw new Error(usersError.message)
      }

      // Fetch user roles separately
      const { data: userRolesData, error: rolesError } = await supabase
        .from('user_role')
        .select(`
          user_id,
          role_id,
          roles(role_id, role_name)
        `)

      if (rolesError) {
        console.warn('Error fetching user roles:', rolesError)
      }

      // Combine users with their roles
      const usersWithRoles = usersData?.map(user => {
        const userRoles = userRolesData?.filter(ur => ur.user_id === user.user_id) || []
        const roles = userRoles.map(ur => ({
          role_id: ur.role_id,
          role_name: (ur.roles as any)?.role_name || 'Unknown'
        }))

        // Ensure user_id is always a string
        return {
          ...user,
          user_id: String(user.user_id || ''),
          roles
        }
      }) || []

      console.log('Fetched users:', usersWithRoles) // Debug log
      setUsers(usersWithRoles)
    } catch (error: any) {
      console.error('Error fetching users:', error)
      setUsersError(error.message || 'Failed to fetch users')
    } finally {
      setIsLoadingUsers(false)
    }
  }

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const handleOpenModal = () => {
    resetForm() // Reset form when opening modal
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    resetForm() // Reset form when closing modal
  }

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
      handleCloseModal() // Close modal on success
      fetchUsers() // Refresh users list
    } else {
      showNotification(result.message, 'error')
    }
  }

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <Navbar 
          title="Admin Dashboard - User Management" 
          onBack={onBack}
          userRole="administrator"
          onProfileClick={onProfileClick}
        />

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          {/* Dashboard Overview */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={onBack}
                  aria-label="go back"
                  sx={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.08)'
                    }
                  }}
                >
                  <ArrowBack />
                </IconButton>
                <Box>
                  <Typography variant="h4" component="h1" color="secondary" gutterBottom>
                    User Management Dashboard
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Manage users, roles, and permissions from this central dashboard.
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PersonAdd />}
                  onClick={handleOpenModal}
                  sx={{
                    py: 1.5,
                    px: 3,
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}
                >
                  Add New User
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Users Table */}
          <Paper sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h5" component="h2" color="secondary">
                Users Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage all users in the system
              </Typography>
            </Box>

            {isLoadingUsers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : usersError ? (
              <Box sx={{ p: 3 }}>
                <Alert severity="error">
                  {usersError}
                </Alert>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>Roles</strong></TableCell>
                      <TableCell><strong>Created At</strong></TableCell>
                      <TableCell><strong>User ID</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No users found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.user_id} hover>
                          <TableCell>
                            <Typography variant="body1" fontWeight="medium">
                              {user.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {user.roles && user.roles.length > 0 ? (
                                user.roles.map((role) => (
                                  <Chip
                                    key={role.role_id}
                                    label={role.role_name}
                                    size="small"
                                    color={
                                      role.role_name === 'Administrator' ? 'error' :
                                      role.role_name === 'Room Manager' ? 'warning' : 'primary'
                                    }
                                    variant="outlined"
                                  />
                                ))
                              ) : (
                                <Chip
                                  label="No Role"
                                  size="small"
                                  variant="outlined"
                                  color="default"
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(user.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                              {user.user_id ? String(user.user_id).substring(0, 8) + '...' : 'N/A'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
          {/* Dashboard Stats Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="secondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h3" component="div">
                  {isLoadingUsers ? '-' : users.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Registered in the system
                </Typography>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" color="secondary" gutterBottom>
                  Active Sessions
                </Typography>
                <Typography variant="h3" component="div">
                  12
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Currently logged in
                </Typography>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" color="secondary" gutterBottom>
                  Room Bookings
                </Typography>
                <Typography variant="h3" component="div">
                  8
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active bookings today
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>

        {/* Add User Modal */}
        <Dialog 
          open={isModalOpen} 
          onClose={handleCloseModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonAdd sx={{ mr: 2, color: 'secondary.main' }} />
              <Typography variant="h5" component="div">
                Add New User
              </Typography>
            </Box>
          </DialogTitle>
          
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create a new user account with encrypted password. This is a developer tool for quick user addition.
            </Typography>

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
          </DialogContent>
          
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={handleCloseModal} 
              variant="outlined"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button for Mobile */}
        <Fab
          color="secondary"
          aria-label="add user"
          onClick={handleOpenModal}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'block', sm: 'none' } // Only show on mobile
          }}
        >
          <Add />
        </Fab>

        <NotificationComponent
          notification={notification}
          onClose={hideNotification}
        />
      </Box>
    </ThemeProvider>
  )
}

export default AdminDashboard
