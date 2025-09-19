import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CssBaseline,
  Button,
  Paper,
  Divider,
  Alert,
  Chip,
  CircularProgress
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { appTheme } from '../services';
import { ArrowBack, Info, CheckCircle, EventAvailable, LocationOn, People } from '@mui/icons-material';
import { Navbar, BookingModal } from '../components/ui';
import Calendar from '../components/ui/Calendar';
import { useAuth, useBooking, useRoomBookings, useBookingConflictCheck, useRoomManagement, useNavigation } from '../hooks';
import useBookingStatusChecker from '../hooks/Booking/useBookingStatusChecker';
import type { Room } from '../hooks/Rooms/useRoomManagement';

interface BookRoomProps {
  onBack?: () => void;
}

const BookRoom: React.FC<BookRoomProps> = ({ onBack }) => {
  // Get room ID from URL parameters
  const { roomId } = useParams<{ roomId: string }>();
  const { goToSearch } = useNavigation();
  
  // State for the room data
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);
  
  // Existing state
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const { hasRole } = useAuth();
  const { createBooking, isLoading: bookingLoading } = useBooking();
  const { rooms, isLoadingRooms, fetchRooms } = useRoomManagement();
  
  // Enable automatic status checking every 5 minutes
  useBookingStatusChecker(5);
  
  // Conditional hooks based on room availability
  const roomIdNum = roomId ? parseInt(roomId) : 0;
  const { bookings, isLoading: calendarLoading, error: calendarError, refreshBookings, getBookingColor } = useRoomBookings(roomIdNum);
  const { checkTimeSlotAvailability } = useBookingConflictCheck();

  // Optimized room loading logic
  useEffect(() => {
    const loadRoom = async () => {
      if (!roomId) {
        setRoomError('Room ID not provided');
        setIsLoadingRoom(false);
        return;
      }

      const roomIdNumber = parseInt(roomId);
      
      // Check if room already exists in loaded rooms
      const existingRoom = rooms.find(r => r.room_id === roomIdNumber);
      if (existingRoom) {
        setRoom(existingRoom);
        setIsLoadingRoom(false);
        setRoomError(null);
        return;
      }

      // If rooms are currently loading, wait for them
      if (isLoadingRooms) {
        return; // Let the loading finish, this effect will run again
      }

      // If no rooms loaded yet, fetch them
      if (rooms.length === 0) {
        try {
          await fetchRooms();
          // After fetching, check again (this will trigger another useEffect)
        } catch (error) {
          setRoomError('Failed to load room details');
          setIsLoadingRoom(false);
          console.error('Error loading room:', error);
        }
        return;
      }

      // Rooms loaded but room not found
      setRoomError('Room not found');
      setIsLoadingRoom(false);
    };

    loadRoom();
  }, [roomId, rooms, isLoadingRooms, fetchRooms]);

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      goToSearch();
    }
  };

  // Show loading state
  if (isLoadingRoom || isLoadingRooms) {
    return (
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading room details...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  // Show error state
  if (roomError || !room) {
    return (
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Alert severity="error">
            {roomError || 'Room not found'}
          </Alert>
        </Container>
      </ThemeProvider>
    );
  }

  const handleBookingConfirm = async (startTime: Date, endTime: Date) => {
    setBookingError(null);
    setBookingSuccess(false);
    
    try {
      const result = await createBooking({
        room_id: room.room_id,
        start_datetime: startTime.toISOString(),
        end_datetime: endTime.toISOString(),
        status: 'Pending'
      });
      
      if (result.success) {
        setBookingSuccess(true);
        // Refresh calendar to show new booking
        refreshBookings();
        return { success: true };
      } else {
        setBookingError(result.error || 'Failed to book room');
        return { success: false, error: result.error || 'Failed to book room' };
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred while booking the room';
      setBookingError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowBookingModal(true);
  };

  const handleModalClose = () => {
    setShowBookingModal(false);
    setSelectedDate(null);
  };

  // Get user roles for navbar display
  const getUserRoleForNavbar = (): 'employee' | 'administrator' => {
    if (hasRole(1)) return 'administrator'; // Role ID 1 is admin
    return 'employee';
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#ffffff' }}>
        <Navbar
          title={`Room Details - ${room.room_name}`}
          onBack={handleBack}
          userRole={getUserRoleForNavbar()}
          onMenuClick={() => {}}
        />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' }, 
            gap: 4 
          }}>
            {/* Left Panel - Room Information */}
            <Box sx={{ flex: { lg: '0 0 400px' }, width: { xs: '100%', lg: '400px' } }}>
              <Paper sx={{ p: 3, height: 'fit-content', backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                {/* Room Header */}
                          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            Back to Search
          </Button>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" component="h1" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {room.room_name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {room.location}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                {/* Room Details */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info /> Room Information
                  </Typography>
                  {room.description && (
                    <Typography variant="body1" paragraph sx={{ color: 'text.primary', mb: 3 }}>
                      {room.description}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                      <LocationOn color="primary" />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                        <Typography variant="body1" color="primary" sx={{ fontWeight: 500 }}>{room.location}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                      <People color="secondary" />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Capacity</Typography>
                        <Typography variant="body1" color="secondary" sx={{ fontWeight: 500 }}>{room.capacity} People</Typography>
                      </Box>
                    </Box>
                  </Box>
                  {/* Features Section */}
                  {room.features && room.features.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom color="primary">
                        Available Features:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {room.features.map((feature, index) => (
                          <Chip
                            key={index}
                            label={feature}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
                {/* Booking Status Messages */}
                {bookingSuccess && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle />
                      Room booked successfully! Your booking is pending approval.
                    </Box>
                  </Alert>
                )}
                {bookingError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {bookingError}
                  </Alert>
                )}
                {/* Booking Action Button */}
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<EventAvailable />}
                  disabled={bookingLoading}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark'
                    }
                  }}
                >
                  Click on Calendar Date to Book
                </Button>
              </Paper>
            </Box>
            {/* Right Panel - Calendar */}
            <Box sx={{ flex: 1 }}>
              {/* Calendar View */}
              <Paper sx={{ p: 3, backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                  <EventAvailable /> Room Bookings - Click Future Dates to Book
                </Typography>
                {/* Calendar Legend */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                    Booking Status:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                    <Chip label="Approved" sx={{ backgroundColor: '#28a745', color: 'white' }} size="small" />
                    <Chip label="Pending" sx={{ backgroundColor: '#ffc107', color: 'black' }} size="small" />
                    <Chip label="Completed" sx={{ backgroundColor: '#17a2b8', color: 'white' }} size="small" />
                    <Chip label="Expired" sx={{ backgroundColor: '#fd7e14', color: 'white' }} size="small" />
                    <Chip label="Rejected" sx={{ backgroundColor: '#dc3545', color: 'white' }} size="small" />
                  </Box>
                </Box>
                {calendarLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Loading bookings...</Typography>
                  </Box>
                ) : calendarError ? (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {calendarError}
                  </Alert>
                ) : (
                  <Box sx={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    backgroundColor: '#ffffff'
                  }}>
                    <Calendar 
                      events={bookings.map(booking => ({
                        ...booking,
                        backgroundColor: getBookingColor(booking.status),
                        borderColor: getBookingColor(booking.status)
                      }))} 
                      onDateClick={handleDateClick}
                    />
                  </Box>
                )}
              </Paper>
            </Box>
            {/* Booking Modal */}
            <BookingModal
              open={showBookingModal}
              onClose={handleModalClose}
              selectedDate={selectedDate}
              roomId={room.room_id}
              roomName={room.room_name}
              onBookingConfirm={handleBookingConfirm}
              onCheckAvailability={checkTimeSlotAvailability}
              isBookingInProgress={bookingLoading}
            />
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default BookRoom;
