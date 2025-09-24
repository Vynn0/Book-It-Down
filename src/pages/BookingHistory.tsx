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

const BookingHistory: React.FC = () => {
  const { user } = useAuth();
  const { getUserBookings, isLoading: isBookingLoading } = useBooking();
  const { goToSearch, goToAdminDashboard, goToRoomManagement } = useNavigation();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const { success, bookings: userBookings, error: fetchError } = await getUserBookings();
      if (success) {
        // Mengurutkan data berdasarkan tanggal pembuatan terbaru
        const sortedBookings = (userBookings || []).sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setBookings(sortedBookings);
      } else {
        setError(fetchError || 'Failed to load booking history.');
      }
    };

    if (user) { // Hanya fetch jika user sudah terautentikasi
      fetchBookings();
    }
  }, [user, getUserBookings]);

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
          activeView="bookingHistory"
          onMenuClick={handleMenuClick}
          open={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
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
            title={`Booking History (${user?.name || 'User'})`}
            onMenuClick={handleSidebarToggle}
          />
          <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
            <Paper sx={{ p: 3, overflow: 'hidden' }}>
              <Typography variant="h5" component="h1" color="secondary" gutterBottom>
                Lists of Finished Bookings
              </Typography>

              {isBookingLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>Loading history...</Typography>
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : bookings.length === 0 ? (
                <Typography sx={{ textAlign: 'center', py: 5 }}>
                  You have no booking history.
                </Typography>
              ) : (
                <TableContainer sx={{ maxHeight: '70vh' }}>
                  <Table stickyHeader aria-label="booking history table">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}><b>ID Booking</b></TableCell>
                        <TableCell sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}><b>User ID</b></TableCell>
                        <TableCell sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}><b>Room ID</b></TableCell>
                        <TableCell sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}><b>Start Time</b></TableCell>
                        <TableCell sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}><b>End Time</b></TableCell>
                        <TableCell sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}><b>Created At</b></TableCell>
                        {/* <TableCell sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}><b>Status</b></TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow
                          key={booking.booking_id}
                          sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }} // Biarkan ini agar baris terakhir tidak ada border bawah ganda
                        >
                          <TableCell component="th" scope="row" sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
                            {booking.booking_id}
                          </TableCell>
                          <TableCell sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>{booking.user_id}</TableCell>
                          <TableCell sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>{booking.room_id}</TableCell>
                          <TableCell sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>{DateTimeUtils.formatLocal(booking.start_datetime)}</TableCell>
                          <TableCell sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>{DateTimeUtils.formatLocal(booking.end_datetime)}</TableCell>
                          <TableCell sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>{DateTimeUtils.formatLocal(booking.created_at)}</TableCell>
                          <TableCell sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>{booking.status}</TableCell>
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

export default BookingHistory;