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
  DialogActions,
  TextField
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
  AccessTime as OngoingIcon,
  Event as UpcomingIcon,
  HistoryToggleOff as ExpiredIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { ThemeProvider } from '@mui/material/styles';
import { appTheme } from '../services';
import { Navbar, Sidebar } from '../components/ui';
import { useAuth, useBooking, useNavigation } from '../hooks';
import { useBookingConflictCheck } from '../hooks/Booking/useBookingConflictCheck';
import type { Booking } from '../hooks/Booking/useBooking';
import { DateTimeUtils } from '../utils/dateUtils';
import { supabase } from '../utils/supabase';

const drawerWidth = 240;

const BookingHistory: React.FC = () => {
  const { user } = useAuth();
  const { getUserBookings, updateBooking, isLoading: isBookingLoading } = useBooking();
  const { isChecking } = useBookingConflictCheck();
  const { goToSearch, goToAdminDashboard, goToRoomManagement } = useNavigation();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State untuk mode edit (diambil dari CurrentBooking)
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedStartTime, setEditedStartTime] = useState<dayjs.Dayjs | null>(null);
  const [editedEndTime, setEditedEndTime] = useState<dayjs.Dayjs | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

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
      case 'expired':
      case 'rejected':
      case 'completed':
        return <Chip icon={<CancelledIcon />} label="Expired" color="error" size="small" />;
      default:
        return <Chip icon={<HistoryIcon />} label={status} color="default" size="small" />;
    }
  };

  // Handle untuk melihat detail
  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
    setIsEditMode(false);
    setEditError(null);
  };

  // Handle untuk mode edit
  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditedTitle(booking.title || '');
    setEditedStartTime(dayjs(booking.start_datetime));
    setEditedEndTime(dayjs(booking.end_datetime));
    setIsEditMode(true);
    setIsModalOpen(true);
    setEditError(null);
  };
  
  // Handle untuk menutup modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedBooking(null);
    setEditError(null);
  };


  // Handle untuk menyimpan perubahan
  const handleSaveEdit = async () => {
    if (!selectedBooking || !editedStartTime || !editedEndTime) {
      setEditError('Please fill in all required fields');
      return;
    }

    if (!editedTitle.trim()) {
      setEditError('Title is required');
      return;
    }

    if (editedTitle.length > 255) {
      setEditError('Title must be 255 characters or less');
      return;
    }

    if (editedStartTime.isAfter(editedEndTime)) {
      setEditError('Start time must be before end time');
      return;
    }

    // Validasi durasi booking tidak lebih dari 8 jam (menggunakan milidetik untuk akurasi)
    const durationInHours = editedEndTime.diff(editedStartTime, 'millisecond') / (1000 * 60 * 60);
    if (durationInHours > 8) {
        setEditError('Booking duration cannot exceed 8 hours');
        return;
    }

    const startDate = editedStartTime.toDate();
    const endDate = editedEndTime.toDate();

    if (startDate < new Date()) {
      setEditError('Cannot schedule booking in the past');
      return;
    }

    setIsUpdating(true);
    setEditError(null);

    try {
      const { data: conflictingBookings, error: conflictError } = await supabase
        .from('booking')
        .select('booking_id')
        .eq('room_id', selectedBooking.room_id)
        .neq('booking_id', selectedBooking.booking_id)
        .in('status', ['Pending', 'Approved'])
        .or(`and(start_datetime.lt.${endDate.toISOString()},end_datetime.gt.${startDate.toISOString()})`);

      if (conflictError) {
        setEditError('Error checking for booking conflicts');
        return;
      }

      if (conflictingBookings && conflictingBookings.length > 0) {
        setEditError('This time slot conflicts with another booking');
        return;
      }

      const result = await updateBooking(selectedBooking.booking_id, {
        title: editedTitle.trim(),
        start_datetime: startDate.toISOString(),
        end_datetime: endDate.toISOString()
      });

      if (result.success && result.booking) {
        setBookings(prev => prev.map(b => b.booking_id === selectedBooking.booking_id ? result.booking! : b));
        setSelectedBooking(result.booking);
        setIsEditMode(false);
        setEditError(null);
        alert('Booking updated successfully!');
      } else {
        setEditError(result.error || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      setEditError('An unexpected error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

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
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 3,
              mb: 3
            }}>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography gutterBottom>
                    Total Bookings
                  </Typography>
                  <Typography variant="h4" component="div" color="primary">
                    {stats.total}
                  </Typography>
                </CardContent>
              </Card>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography gutterBottom>
                    <OngoingIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} /> Ongoing
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {stats.ongoing}
                  </Typography>
                </CardContent>
              </Card>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography gutterBottom>
                    <UpcomingIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} /> Upcoming
                  </Typography>
                  <Typography variant="h4" component="div" color="warning.main">
                    {stats.upcoming}
                  </Typography>
                </CardContent>
              </Card>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography gutterBottom>
                    <ExpiredIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} /> Expired
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    {stats.expired}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            
            <Paper elevation={3} sx={{ overflow: 'hidden' }}>
              <Box sx={{ p: 3, pb: 0 }}>
                <Typography variant="h5" component="h1" color="secondary" gutterBottom>
                  Booking History
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
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
                  <Typography variant="h6" gutterBottom>
                    No Booking History
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3 }}>
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
                        <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 'bold', borderBottom: 2, borderColor: 'divider' }}>
                          Booking Details
                        </TableCell>
                        <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 'bold', borderBottom: 2, borderColor: 'divider' }}>
                          Title
                        </TableCell>
                        <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 'bold', borderBottom: 2, borderColor: 'divider' }}>
                          Schedule
                        </TableCell>
                        <TableCell align="center" sx={{ bgcolor: 'grey.50', fontWeight: 'bold', borderBottom: 2, borderColor: 'divider' }}>
                          Status
                        </TableCell>
                        <TableCell align="center" sx={{ bgcolor: 'grey.50', fontWeight: 'bold', borderBottom: 2, borderColor: 'divider' }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow
                          key={booking.booking_id}
                          sx={{ '&:nth-of-type(odd)': { bgcolor: 'grey.25' }, '&:hover': { bgcolor: 'action.hover' }, transition: 'background-color 0.2s ease' }}
                        >
                          <TableCell>
                            <Stack spacing={1}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                #{booking.booking_id}
                              </Typography>
                              <Typography variant="body2">
                                Room: {booking.room_id}
                              </Typography>
                              <Typography variant="caption">
                                Created: {DateTimeUtils.formatLocal(booking.created_at)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: 'primary.main', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
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
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Tooltip title="View Details">
                                <IconButton size="small" color="primary" onClick={() => handleViewBooking(booking)}>
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {booking.status?.toLowerCase() === 'pending' && (
                                <Tooltip title="Edit Booking">
                                  <IconButton size="small" color="secondary" onClick={() => handleEditBooking(booking)}>
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

      {/* MODAL DIALOG BARU (SAMA SEPERTI DI CURRENT BOOKINGS) */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            {isEditMode ? 'Edit Booking' : 'Booking Details'} #{selectedBooking?.booking_id}
          </Typography>
          <IconButton onClick={handleCloseModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedBooking && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack spacing={3}>
                {editError && (
                  <Alert severity="error">
                    {editError}
                  </Alert>
                )}

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Title
                    </Typography>
                    {isEditMode ? (
                      <TextField
                        fullWidth
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        placeholder="Enter booking title"
                        variant="outlined"
                        size="small"
                        inputProps={{ maxLength: 255 }}
                        helperText={`${editedTitle.length}/255 characters`}
                      />
                    ) : (
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 500 }}>
                        {selectedBooking.title || 'No title'}
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Room
                    </Typography>
                    <Typography variant="body1">{selectedBooking.room_id}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Status
                    </Typography>
                    {getStatusChip(selectedBooking.status || 'unknown')}
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Start Time
                    </Typography>
                    {isEditMode ? (
                      <DateTimePicker
                        value={editedStartTime}
                        onChange={(newValue) => setEditedStartTime(newValue ? dayjs(newValue) : null)}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                        minDateTime={dayjs()}
                      />
                    ) : (
                      <Typography variant="body1">
                        {DateTimeUtils.formatLocal(selectedBooking.start_datetime)}
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      End Time
                    </Typography>
                    {isEditMode ? (
                      <DateTimePicker
                        value={editedEndTime}
                        onChange={(newValue) => setEditedEndTime(newValue ? dayjs(newValue) : null)}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                        minDateTime={editedStartTime || dayjs()}
                      />
                    ) : (
                      <Typography variant="body1">
                        {DateTimeUtils.formatLocal(selectedBooking.end_datetime)}
                      </Typography>
                    )}
                  </Box>

                  {!isEditMode && (
                    <>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          Created
                        </Typography>
                        <Typography variant="body1">
                          {DateTimeUtils.formatLocal(selectedBooking.created_at)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          User ID
                        </Typography>
                        <Typography variant="body1">{selectedBooking.user_id}</Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </Stack>
            </LocalizationProvider>
          )}
        </DialogContent>
        <DialogActions>
          {isEditMode ? (
            <>
              <Button
                variant="contained"
                onClick={handleSaveEdit}
                disabled={isUpdating || isChecking}
                startIcon={isUpdating ? <CircularProgress size={16} /> : <SaveIcon />}
                sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#45a049' } }}
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button onClick={handleCloseModal}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              {selectedBooking?.status?.toLowerCase() === 'pending' && (
                <Button variant="contained" color="secondary" startIcon={<EditIcon />} onClick={() => setIsEditMode(true)}>
                  Edit Booking
                </Button>
              )}
              <Button onClick={handleCloseModal}>
                Close
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default BookingHistory;