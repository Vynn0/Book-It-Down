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
  Divider
} from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { appTheme } from '../services'
import { PersonAdd, Add } from '@mui/icons-material'
import { Navbar, NotificationComponent, UserTable, EditUserModal, Sidebar } from '../components/ui'
import { UserFormComponent } from '../components/auth'
import { useUserManagement, useNotification, useNavigation, useUsers, useAllBookings } from '../hooks'
import { supabase } from '../utils/supabase'
import type { DatabaseUser } from '../types/user'
import { useState } from 'react'

interface AdminDashboardProps {
  onBack?: () => void;
  onProfileClick?: () => void;
  onNavigateToSearch?: () => void;
  onNavigateToRoomManagement?: () => void;
}

const drawerWidth = 240; // Definisikan lebar drawer

function AdminDashboard({ onBack, onProfileClick, onNavigateToSearch, onNavigateToRoomManagement }: AdminDashboardProps) {
  const {
    goToLogin,
    goToProfile,
    goToSearch,
    goToRoomManagement
  } = useNavigation();

  const { users, isLoading: isLoadingUsers, error: usersError, refetchUsers } = useUsers();
  
  // Get all bookings data for admin dashboard stats
  const { 
    isLoading: isLoadingBookings, 
    getTodayBookingsCount, 
    getActiveBookingsCount 
  } = useAllBookings();

  const [activeView, setActiveView] = useState('userManagement');
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<DatabaseUser | null>(null)

  const [isSidebarOpen, setSidebarOpen] = useState(true); // Default: terbuka untuk tampilan desktop

  const handleSidebarToggle = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Centralized navigation functions with fallbacks
  const handleBackNavigation = () => {
    if (onBack) {
      onBack();
    } else {
      goToLogin();
    }
  };

  const handleProfileNavigation = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      goToProfile();
    }
  };

  const handleSearchNavigation = () => {
    if (onNavigateToSearch) {
      onNavigateToSearch();
    } else {
      goToSearch();
    }
  };

  const handleRoomManagementNavigation = () => {
    if (onNavigateToRoomManagement) {
      onNavigateToRoomManagement();
    } else {
      goToRoomManagement();
    }
  };

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

  // Router-aware menu click handler
  const handleMenuClick = (view: string) => {
    if (view === 'addBooking') {
      handleSearchNavigation();
    } else if (view === 'roomManagement') {
      handleRoomManagementNavigation();
    } else {
      setActiveView(view);
    }
  };

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
      refetchUsers()
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
      refetchUsers()
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
        <Sidebar
          activeView={activeView}
          onMenuClick={handleMenuClick}
          open={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            // Perubahan styling untuk efek push
            transition: (theme) => theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: `-${drawerWidth}px`,
            ...(isSidebarOpen && {
              transition: (theme) => theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
              }),
              marginLeft: 0,
            }),
          }}
        >
          <Navbar
            title="Admin Dashboard"
            onBack={handleBackNavigation}
            userRole="administrator"
            onProfileClick={handleProfileNavigation}
            onMenuClick={handleSidebarToggle} // Tetap gunakan handler ini
          />

          <Container maxWidth="lg" sx={{ mt: 2 }}>
            <Box sx={{ pt: 3, pl: 3, pr: 3, gap: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h1" color="secondary" gutterBottom>
                  User Management Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage users, roles, and permissions from this central dashboard.
                </Typography>
              </Box>
              <Divider sx={{ mb: 3, borderTop: '1px solid' }} />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
                <Card sx={{ border: '1px solid rgba(0,0,0,0.2)', boxShadow: '0 5px 5px 0 rgba(0,0,0,0.2)' }}>
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

                <Card sx={{ border: '1px solid rgba(0,0,0,0.2)', boxShadow: '0 5px 5px 0 rgba(0,0,0,0.2)' }}>
                  <CardContent>
                    <Typography variant="h6" color="secondary" gutterBottom>
                      Active Sessions
                    </Typography>
                    <Typography variant="h3" component="div">
                      {isLoadingBookings ? '-' : getActiveBookingsCount()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total pending/approved bookings
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ border: '1px solid rgba(0,0,0,0.2)', boxShadow: '0 5px 5px 0 rgba(0,0,0,0.2)' }}>
                  <CardContent>
                    <Typography variant="h6" color="secondary" gutterBottom>
                      Room Bookings
                    </Typography>
                    <Typography variant="h3" component="div">
                      {isLoadingBookings ? '-' : getTodayBookingsCount()}
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
            </Box>
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