import React, { useState } from 'react';
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
  Alert,
  Chip,
  Stack
} from '@mui/material';
import { History as HistoryIcon } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { appTheme } from '../services';
import { Navbar, Sidebar } from '../components/ui';
import { useNavigation } from '../hooks';
import { useAllBookingsAdmin } from '../hooks/Booking/useAllBookingsAdmin'; // Hook baru
import { DateTimeUtils } from '../utils/dateUtils';

const drawerWidth = 240;

const AllUsersBookings: React.FC = () => {
  const { goToSearch, goToAdminDashboard, goToRoomManagement } = useNavigation();
  const { bookings, isLoading, error } = useAllBookingsAdmin();

  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleMenuClick = (view: string) => {
    if (view === 'userManagement') goToAdminDashboard();
    else if (view === 'roomManagement') goToRoomManagement();
    else if (view === 'addBooking') goToSearch();
  };
  
  const getStatusChip = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Chip label="Upcoming" color="warning" size="small" />;
      case 'approved':
        return <Chip label="Ongoing" color="success" size="small" />;
      case 'cancelled':
      case 'rejected':
      case 'completed':
      case 'expired':
        return <Chip label="Expired" color="error" size="small" />;
      default:
        return <Chip label={status || 'Unknown'} color="default" size="small" />;
    }
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Sidebar
          activeView="allUsersBookings"
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
              marginLeft: 0,
            }),
          }}
        >
          <Navbar
            title="All User Bookings"
            onMenuClick={handleSidebarToggle}
          />
          <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" component="h1" color="secondary" gutterBottom>
                All Users Booking History
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                View all booking activities from every user in the system.
              </Typography>
              
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : bookings.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
                  <Typography variant="h6" color="text.secondary">No bookings found.</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Booking Details</strong></TableCell>
                        <TableCell><strong>User</strong></TableCell> {/* KOLOM BARU */}
                        <TableCell><strong>Title</strong></TableCell>
                        <TableCell><strong>Schedule</strong></TableCell>
                        <TableCell align="center"><strong>Status</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.booking_id} hover>
                          <TableCell>
                            <Stack>
                              <Typography variant="subtitle2">#{booking.booking_id}</Typography>
                              <Typography variant="caption">Room: {booking.room_name}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell> {/* DATA BARU */}
                            <Typography variant="body2">{booking.user_name}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{booking.title}</Typography>
                          </TableCell>
                          <TableCell>
                            <Stack>
                              <Typography variant="body2">
                                <strong>Start:</strong> {DateTimeUtils.formatLocal(booking.start_datetime)}
                              </Typography>
                              <Typography variant="body2">
                                <strong>End:</strong> {DateTimeUtils.formatLocal(booking.end_datetime)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="center">
                            {getStatusChip(booking.status || 'unknown')}
                          </TableCell>
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

export default AllUsersBookings;