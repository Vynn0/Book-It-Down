import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  CssBaseline,
  CircularProgress,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { appTheme } from '../services';
import { Navbar, Sidebar } from '../components/ui';
import { useAuth, useBooking, useNavigation } from '../hooks';
import type { Booking } from '../hooks/Booking/useBooking';
import { DateTimeUtils } from '../utils/dateUtils';

const drawerWidth = 240;

const CurrentBooking: React.FC = () => {
  const { user } = useAuth();
  const { getCurrentBookings, isLoading: isBookingLoading } = useBooking(); // ✅ pastikan ada di hook
  const { goToSearch, goToAdminDashboard, goToRoomManagement } = useNavigation();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const { success, bookings: currentBookings, error: fetchError } = await getCurrentBookings();
      if (success) {
        // Urutkan berdasarkan waktu mulai terdekat
        const sortedBookings = (currentBookings || []).sort((a, b) =>
          new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
        );
        setBookings(sortedBookings);
      } else {
        setError(fetchError || 'Failed to load current bookings.');
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user, getCurrentBookings]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleMenuClick = (view: string) => {
    if (view === 'userManagement') goToAdminDashboard();
    else if (view === 'roomManagement') goToRoomManagement();
    else if (view === 'addBooking') goToSearch();
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Sidebar
          activeView="currentBooking"
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
            title={`Current Booking (${user?.name || 'User'})`}
            onMenuClick={handleSidebarToggle}
          />
          <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
            <Paper sx={{ p: 3, overflow: 'hidden' }}>
              <Typography variant="h5" component="h1" color="secondary" gutterBottom>
                Your Ongoing Bookings
              </Typography>

              {isBookingLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>Loading current bookings...</Typography>
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : bookings.length === 0 ? (
                <Typography sx={{ textAlign: 'center', py: 5 }}>
                  You have no ongoing bookings.
                </Typography>
              ) : (
                <TableContainer sx={{ maxHeight: '70vh' }}>
                  <Table stickyHeader aria-label="current bookings table">
                    <TableHead>
                      <TableRow>
                        <TableCell><b>ID Booking</b></TableCell>
                        <TableCell><b>User ID</b></TableCell>
                        <TableCell><b>Room ID</b></TableCell>
                        <TableCell><b>Start Time</b></TableCell>
                        <TableCell><b>End Time</b></TableCell>
                        <TableCell><b>Status</b></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.booking_id}>
                          <TableCell>{booking.booking_id}</TableCell>
                          <TableCell>{booking.user_id}</TableCell>
                          <TableCell>{booking.room_id}</TableCell>
                          <TableCell>{DateTimeUtils.formatLocal(booking.start_datetime)}</TableCell>
                          <TableCell>{DateTimeUtils.formatLocal(booking.end_datetime)}</TableCell>
                          <TableCell>{booking.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CurrentBooking;
