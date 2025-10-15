import React, { useState, useEffect } from 'react'; // <-- Tambahkan useEffect
import {
  Box,
  Container,
  Typography,
  CssBaseline,
  Paper,
  Avatar,
  TextField,
  Stack,
  Divider,
  Button
} from '@mui/material';
import { Logout } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { appTheme } from '../services';
import { Navbar, Sidebar } from '../components/ui';
import { useAuth, useNavigation, useBooking } from '../hooks'; // <-- Tambahkan useBooking

const drawerWidth = 240;

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { getUserBookings } = useBooking(); // <-- Panggil hook useBooking
  const { goToLogin, goToSearch, goToAdminDashboard, goToRoomManagement } = useNavigation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // --- TAMBAHKAN STATE BARU UNTUK MENYIMPAN JUMLAH BOOKING ---
  const [bookingCount, setBookingCount] = useState<number>(0);
  const [isLoadingCount, setIsLoadingCount] = useState(true);
  // -----------------------------------------------------------

  // --- TAMBAHKAN useEffect UNTUK MENGAMBIL DATA BOOKING ---
  useEffect(() => {
    if (user) {
      const fetchBookingCount = async () => {
        setIsLoadingCount(true);
        const { success, bookings } = await getUserBookings();
        if (success && bookings) {
          setBookingCount(bookings.length);
        }
        setIsLoadingCount(false);
      };

      fetchBookingCount();
    }
  }, [user, getUserBookings]);
  // ----------------------------------------------------

  const handleSidebarToggle = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  
  const handleLogout = () => {
    logout();
    goToLogin();
  };

  const handleMenuClick = (view: string) => {
    switch (view) {
      case 'userManagement':
        goToAdminDashboard();
        break;
      case 'roomManagement':
        goToRoomManagement();
        break;
      case 'addBooking':
        goToSearch();
        break;
      default:
        break;
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getUserRoles = () => {
    if (!user?.roles || user.roles.length === 0) return 'No role assigned';
    return user.roles.map(role => role.role_name).join(', ');
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Sidebar
          activeView="profile"
          onMenuClick={handleMenuClick}
          open={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            transition: (theme) =>
              theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            marginLeft: `-${drawerWidth}px`,
            ...(isSidebarOpen && {
              transition: (theme) =>
                theme.transitions.create('margin', {
                  easing: theme.transitions.easing.easeOut,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              marginLeft: 0,
            }),
          }}
        >
          <Navbar
            title={`My Profile (${user?.name || 'User'})`}
            onMenuClick={handleSidebarToggle}
          />
          <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: 3 }}>
              <Stack spacing={4} alignItems="center">
                <Avatar sx={{ width: 120, height: 120, fontSize: '3rem', bgcolor: 'primary.main' }}>
                  {getUserInitials()}
                </Avatar>
                
                <Box textAlign="center">
                    <Typography variant="h4" component="h1" gutterBottom>
                        {user?.name || 'N/A'}
                    </Typography>
                     <Typography variant="h6" color="text.secondary">
                        {getUserRoles()}
                    </Typography>
                </Box>
                
                <Divider sx={{ width: '100%' }} />

                <Stack spacing={3} sx={{ width: '100%' }}>
                  <TextField
                    label="Full Name"
                    value={user?.name || 'N/A'}
                    variant="filled"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Email Address"
                    value={user?.email || 'N/A'}
                    variant="filled"
                    InputProps={{ readOnly: true }}
                  />
                  {/* === BAGIAN INI ADALAH TOTAL BOOKINGS === */}
                  <TextField
                    label="Total Bookings Made"
                    value={isLoadingCount ? 'Loading...' : bookingCount}
                    variant="filled"
                    InputProps={{ readOnly: true }}
                  />
                  {/* ========================================================== */}
                  <TextField
                    label="Account Created"
                    value={user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    }) : 'N/A'}
                    variant="filled"
                    InputProps={{ readOnly: true }}
                  />
                </Stack>

                <Button 
                    variant="contained" 
                    color="error" 
                    startIcon={<Logout />}
                    onClick={handleLogout}
                    sx={{ mt: 2, px: 4, py: 1.5, borderRadius: 2 }}
                >
                    Logout
                </Button>
              </Stack>
            </Paper>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Profile;