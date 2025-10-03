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
  Divider,
  IconButton,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Cancel as CancelledIcon,
  History as HistoryIcon,
  Close as CloseIcon,
  AccessTime as OngoingIcon,      // <-- Tambahan ikon
  Event as UpcomingIcon,        // <-- Tambahan ikon
  HistoryToggleOff as ExpiredIcon // <-- Tambahan ikon
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
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      const { success, bookings: userBookings, error: fetchError } = await getUserBookings();
      if (success) {
        const sortedBookings = (userBookings || []).sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setBookings(sortedBookings);
      } else {
        setError(fetchError || 'Failed to load booking history.');
      }
    };

    if (user) {
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

  const getStatusChip = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Chip icon={<ApprovedIcon />} label="Ongoing" color="success" size="small" />;
      case 'pending':
        return <Chip icon={<PendingIcon />} label="Upcoming" color="warning" size="small" />;
      case 'cancelled':
      case 'expired': // Menangani status 'expired' dari backend
      case 'rejected':
      case 'completed':
        return <Chip icon={<CancelledIcon />} label="Expired" color="error" size="small" />;
      default:
        return <Chip icon={<HistoryIcon />} label={status} color="default" size="small" />;
    }
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleBookingAction = (booking: Booking) => {
    handleViewBooking(booking);
  };

  // ### PERUBAHAN LOGIKA STATISTIK DIMULAI DI SINI ###
  const getBookingStats = () => {
    const stats = {
      total: bookings.length,
      ongoing: bookings.filter(b => b.status?.toLowerCase() === 'approved').length,
      upcoming: bookings.filter(b => b.status?.toLowerCase() === 'pending').length,
      expired: bookings.filter(b => 
        !['approved', 'pending'].includes(b.status?.toLowerCase() || '')
      ).length,
    };
    return stats;
  };
  const stats = getBookingStats();
  // ### AKHIR PERUBAHAN LOGIKA STATISTIK ###

  const getUserRoles = () => {
    if (!user?.roles || user.roles.length === 0) return 'No role assigned';
    return user.roles.map(role => role.role_name).join(', ');
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
            title={`Booking History (${getUserRoles()})`}
            onMenuClick={handleSidebarToggle}
          />
          <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
            {/* ### PERUBAHAN KARTU STATISTIK DIMULAI DI SINI ### */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 3,
              mb: 3
            }}>
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
              <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary" gutterBottom>
                    <OngoingIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} /> Ongoing
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {stats.ongoing}
                  </Typography>
                </CardContent>
              </Card>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary" gutterBottom>
                    <UpcomingIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} /> Upcoming
                  </Typography>
                  <Typography variant="h4" component="div" color="warning.main">
                    {stats.upcoming}
                  </Typography>
                </CardContent>
              </Card>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary" gutterBottom>
                    <ExpiredIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} /> Expired
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    {stats.expired}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            {/* ### AKHIR PERUBAHAN KARTU STATISTIK ### */}
            
            {/* Sisa dari file tidak ada perubahan */}
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
                          Title
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
                      {bookings.map((booking) => (
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
                            <Typography variant="body2" sx={{
                              fontWeight: 500,
                              color: 'primary.main',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '200px'
                            }}>
                              {booking.title || 'No title'}
                            </Typography>
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

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Booking Details #{selectedBooking?.booking_id}
          </Typography>
          <IconButton onClick={() => setIsModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedBooking && (
            <Stack spacing={3}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                  <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 500 }}>
                    {selectedBooking.title || 'No title'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Room</Typography>
                  <Typography variant="body1">{selectedBooking.room_id}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  {getStatusChip(selectedBooking.status || 'unknown')}
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Start Time</Typography>
                  <Typography variant="body1">{DateTimeUtils.formatLocal(selectedBooking.start_datetime)}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">End Time</Typography>
                  <Typography variant="body1">{DateTimeUtils.formatLocal(selectedBooking.end_datetime)}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                  <Typography variant="body1">{DateTimeUtils.formatLocal(selectedBooking.created_at)}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">User ID</Typography>
                  <Typography variant="body1">{selectedBooking.user_id}</Typography>
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default BookingHistory;