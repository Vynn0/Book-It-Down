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
  Close as CloseIcon,
  EventAvailable as EventIcon
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { appTheme } from '../services';
import { Navbar, Sidebar } from '../components/ui';
import { useAuth, useBooking, useNavigation } from '../hooks';
import type { Booking } from '../hooks/Booking/useBooking';
import { DateTimeUtils } from '../utils/dateUtils';

const drawerWidth = 240;

const CurrentBooking: React.FC = () => {
  const { user } = useAuth();
  const { getCurrentBookings, isLoading: isBookingLoading } = useBooking();
  const { goToSearch, goToAdminDashboard, goToRoomManagement } = useNavigation();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  }, [user]); // Removed getCurrentBookings from dependencies

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
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };

  // Handle viewing booking details
  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  // Handle editing booking (placeholder for now)
  const handleEditBooking = (booking: Booking) => {
    console.log('Edit booking:', booking.booking_id);
    // Future implementation: navigate to edit booking page or open edit modal
  };

  // Get statistics
  const getBookingStats = () => {
    const stats = {
      total: bookings.length,
      approved: bookings.filter(b => b.status?.toLowerCase() === 'approved').length,
      pending: bookings.filter(b => b.status?.toLowerCase() === 'pending').length,
    };
    return stats;
  };

  const stats = getBookingStats();

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
            title={`Current Bookings (${user?.name || 'User'})`}
            onMenuClick={handleSidebarToggle}
          />
          <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
            {/* Statistics Cards */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, 
              gap: 3, 
              mb: 3 
            }}>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary" gutterBottom>
                    Total Current
                  </Typography>
                  <Typography variant="h4" component="div" color="primary">
                    {stats.total}
                  </Typography>
                </CardContent>
              </Card>
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
            </Box>

            {/* Main Content */}
            <Paper elevation={3} sx={{ overflow: 'hidden' }}>
              <Box sx={{ p: 3, pb: 0 }}>
                <Typography variant="h5" component="h1" color="secondary" gutterBottom>
                  Current & Upcoming Bookings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Manage your approved and pending room bookings
                </Typography>
                <Divider />
              </Box>

              {isBookingLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                  <CircularProgress size={40} />
                  <Typography sx={{ ml: 2 }}>Loading current bookings...</Typography>
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
                  <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Current Bookings
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    You have no approved or pending bookings at this time.
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
                  <Table stickyHeader aria-label="current bookings table">
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
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Tooltip title="View Details">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => handleViewBooking(booking)}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {booking.status?.toLowerCase() === 'pending' && (
                                <Tooltip title="Edit Booking">
                                  <IconButton 
                                    size="small" 
                                    color="secondary"
                                    onClick={() => handleEditBooking(booking)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
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

      {/* Booking Details Modal */}
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
          {selectedBooking?.status?.toLowerCase() === 'pending' && (
            <Button 
              variant="contained" 
              color="secondary"
              startIcon={<EditIcon />}
              onClick={() => {
                setIsModalOpen(false);
                handleEditBooking(selectedBooking);
              }}
            >
              Edit Booking
            </Button>
          )}
          <Button onClick={() => setIsModalOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default CurrentBooking;
