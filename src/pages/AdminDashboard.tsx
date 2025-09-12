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
  IconButton
} from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { appTheme } from '../services'
import { PersonAdd, Add } from '@mui/icons-material'
import { Navbar, NotificationComponent, UserTable, EditUserModal, Sidebar } from '../components/ui'
import { UserFormComponent } from '../components/auth'
import { useUserManagement, useNotification } from '../hooks'
import { supabase } from '../utils/supabase'
import type { DatabaseUser } from '../types/user'
import { useState, useEffect } from 'react'

interface AdminDashboardProps {
  onBack: () => void
  onProfileClick?: () => void
  onNavigateToSearch: () => void; // Perubahan: Tambahkan prop baru
}

function AdminDashboard({ onBack, onProfileClick, onNavigateToSearch }: AdminDashboardProps) { // Perubahan: Terima prop baru
  const [activeView, setActiveView] = useState('userManagement');
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<DatabaseUser | null>(null)
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

  // Perubahan: Buat handler untuk klik menu sidebar
  const handleMenuClick = (view: string) => {
    if (view === 'addBooking') {
      onNavigateToSearch(); // Panggil fungsi navigasi
    } else {
      setActiveView(view);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true)
      setUsersError(null)

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

      const usersWithRoles = usersData?.map(user => {
        const userRoles = userRolesData?.filter(ur => ur.user_id === user.user_id) || []
        const roles = userRoles.map(ur => ({
          role_id: ur.role_id,
          role_name: (ur.roles as any)?.role_name || 'Unknown'
        }))

        return {
          ...user,
          user_id: String(user.user_id || ''),
          roles
        }
      }) || []

      console.log('Fetched users:', usersWithRoles)
      setUsers(usersWithRoles)
    } catch (error: any) {
      console.error('Error fetching users:', error)
      setUsersError(error.message || 'Failed to fetch users')
    } finally {
      setIsLoadingUsers(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleOpenModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const handleOpenEditModal = (user: DatabaseUser) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedUser(null)
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
      handleCloseModal()
      fetchUsers()
    } else {
      showNotification(result.message, 'error')
    }
  }

  const handleConfirmEdit = async (userId: string, newName: string, newRoleIds: number[]) => {
    try {
      const { error: userError } = await supabase
        .from('user')
        .update({ name: newName })
        .eq('user_id', userId)

      if (userError) {
        throw userError
      }

      const { error: deleteError } = await supabase
        .from('user_role')
        .delete()
        .eq('user_id', userId)

      if (deleteError) {
        throw deleteError
      }

      if (newRoleIds.length > 0) {
        const roleInserts = newRoleIds.map(roleId => ({
          user_id: userId,
          role_id: roleId
        }))

        const { error: insertError } = await supabase
          .from('user_role')
          .insert(roleInserts)

        if (insertError) {
          throw insertError
        }
      }

      showNotification('User updated successfully!', 'success')
      fetchUsers()
      handleCloseEditModal()
    } catch (error: any) {
      console.error('Error updating user:', error)
      showNotification(error.message || 'Failed to update user', 'error')
    }
  }

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {/* Perubahan: Gunakan handler baru untuk onMenuClick */}
        <Sidebar activeView={activeView} onMenuClick={handleMenuClick} />

        <Box component="main" sx={{ flexGrow: 1}}>
          <Navbar
            title="Admin Dashboard"
            onBack={onBack}
            userRole="administrator"
            onProfileClick={onProfileClick}
          />

          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, mb: 4 }}>
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
            </Paper>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
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

            <UserTable
              users={users}
              isLoading={isLoadingUsers}
              error={usersError}
              onAddUser={handleOpenModal}
              onEditUser={handleOpenEditModal}
            />
          </Container>

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

          <EditUserModal
            open={isEditModalOpen}
            user={selectedUser}
            onClose={handleCloseEditModal}
            onEditUser={(user) => {
              console.log('Edit mode activated for user:', user)
            }}
            onConfirmEdit={handleConfirmEdit}
          />

          <Fab
            color="secondary"
            aria-label="add user"
            onClick={handleOpenModal}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              display: { xs: 'block', sm: 'none' }
            }}
          >
            <Add />
          </Fab>

          <NotificationComponent
            notification={notification}
            onClose={hideNotification}
          />
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default AdminDashboard