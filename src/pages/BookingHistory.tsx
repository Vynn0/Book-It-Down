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
  Alert,
  Chip,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Cancel as CancelledIcon,
  History as HistoryIcon
} from '@mui/icons-material';
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

  // Get status-specific styling
  const getStatusChip = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Chip icon={<ApprovedIcon />} label="Approved" color="success" size="small" />;
      case 'pending':
        return <Chip icon={<PendingIcon />} label="Pending" color="warning" size="small" />;
      case 'cancelled':
        return <Chip icon={<CancelledIcon />} label="Cancelled" color="error" size="small" />;
      default:
        return <Chip icon={<HistoryIcon />} label={status} color="default" size="small" />;
    }
  };

  // Handle action button for pending/approved bookings
  const handleBookingAction = (booking: Booking) => {
    // Placeholder for now - this could navigate to edit/manage booking
    console.log('Action for booking:', booking.booking_id);
    // Future implementation: navigate to booking details or edit page
  };

  // Get statistics
  const getBookingStats = () => {
    const stats = {
      total: bookings.length,
      approved: bookings.filter(b => b.status?.toLowerCase() === 'approved').length,
      pending: bookings.filter(b => b.status?.toLowerCase() === 'pending').length,
      cancelled: bookings.filter(b => b.status?.toLowerCase() === 'cancelled').length,
    };
    return stats;
  };

  const stats = getBookingStats();

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
            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography color="text.secondary" gutterBottom>
                      Total Bookings
                    </Typography>
                    <Typography variant="h4" component="div" color="primary">
                      {stats.total}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography color="text.secondary" gutterBottom>
                      Approved
                    </Typography>
                    <Typography variant="h4" component="div" color="success.main">
                      {stats.approved}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography color="text.secondary" gutterBottom>
                      Pending
                    </Typography>
                    <Typography variant="h4" component="div" color="warning.main">
                      {stats.pending}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography color="text.secondary" gutterBottom>
                      Cancelled
                    </Typography>
                    <Typography variant="h4" component="div" color="error.main">
                      {stats.cancelled}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Main Content */}
            <Paper elevation={3} sx={{ overflow: 'hidden' }}>
              <Box sx={{ p: 3, pb: 0 }}>
                <Typography variant="h5" component="h1" color="secondary" gutterBottom>
                  Booking History
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  View and manage all your room booking requests
                </Typography>
                <Divider />
              </Box>

              {isBookingLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                  <CircularProgress size={40} />
                  <Typography sx={{ ml: 2 }}>Loading your booking history...</Typography>
                </Box>
              ) : error ? (
                <Box sx={{ p: 3 }}>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                  <Button 
                    variant="outlined" 
                    onClick={() => window.location.reload()}
                    sx={{ mt: 1 }}
                  >
                    Try Again
                  </Button>
                </Box>
              ) : bookings.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Booking History
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    You haven't made any room bookings yet.
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<ScheduleIcon />}
                    onClick={goToSearch}
                  >
                    Book a Room
                  </Button>
                </Box>
              ) : (
                <TableContainer sx={{ maxHeight: '60vh' }}>
                  <Table stickyHeader aria-label="booking history table">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ 
                          bgcolor: 'grey.50', 
                          fontWeight: 'bold',
                          borderBottom: 2,
                          borderColor: 'divider'
                        }}>
                          Booking Details
                        </TableCell>
                        <TableCell sx={{ 
                          bgcolor: 'grey.50', 
                          fontWeight: 'bold',
                          borderBottom: 2,
                          borderColor: 'divider'
                        }}>
                          Schedule
                        </TableCell>
                        <TableCell align="center" sx={{ 
                          bgcolor: 'grey.50', 
                          fontWeight: 'bold',
                          borderBottom: 2,
                          borderColor: 'divider'
                        }}>
                          Status
                        </TableCell>
                        <TableCell align="center" sx={{ 
                          bgcolor: 'grey.50', 
                          fontWeight: 'bold',
                          borderBottom: 2,
                          borderColor: 'divider'
                        }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bookings.map((booking, index) => (
                        <TableRow
                          key={booking.booking_id}
                          sx={{ 
                            '&:nth-of-type(odd)': { bgcolor: 'grey.25' },
                            '&:hover': { bgcolor: 'action.hover' },
                            transition: 'background-color 0.2s ease'
                          }}
                        >
                          <TableCell>
                            <Stack spacing={1}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                #{booking.booking_id}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Room: {booking.room_id}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Created: {DateTimeUtils.formatLocal(booking.created_at)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack spacing={1}>
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
                          <TableCell align="center">
                            {(booking.status?.toLowerCase() === 'pending' || booking.status?.toLowerCase() === 'approved') ? (
                              <Stack direction="row" spacing={1} justifyContent="center">
                                <Tooltip title="View Details">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleBookingAction(booking)}
                                  >
                                    <ViewIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                {booking.status?.toLowerCase() === 'pending' && (
                                  <Tooltip title="Edit Booking">
                                    <IconButton 
                                      size="small" 
                                      color="secondary"
                                      onClick={() => handleBookingAction(booking)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Stack>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                No actions
                              </Typography>
                            )}
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

export default BookingHistory;