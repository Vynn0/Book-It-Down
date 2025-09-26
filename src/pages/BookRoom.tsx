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
  CircularProgress,
  IconButton,
  CardMedia
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { appTheme } from '../services';
import { ArrowBack, Info, CheckCircle, EventAvailable, LocationOn, People, ChevronLeft, ChevronRight, ImageNotSupported } from '@mui/icons-material';
import { Navbar, BookingModal, Sidebar } from '../components/ui';
import Calendar from '../components/ui/Calendar';
import { useAuth, useBooking, useRoomBookings, useBookingConflictCheck, useRoomManagement, useNavigation, useRoomImages } from '../hooks';
import useBookingStatusChecker from '../hooks/Booking/useBookingStatusChecker';
import type { Room } from '../hooks/Rooms/useRoomManagement';

interface BookRoomProps {
  onBack?: () => void;
}

const BookRoom: React.FC<BookRoomProps> = ({ onBack }) => {
  // Get room ID from URL parameters
  const { roomId } = useParams<{ roomId: string }>();
  const { goToSearch, goToAdminDashboard, goToRoomManagement } = useNavigation(); // Tambahkan navigasi lain
  
  // State for the room data
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);
  
  // Image carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('addBooking');
  const drawerWidth = 240;
  
  // Existing state
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const { hasRole } = useAuth();
  const { createBooking, isLoading: bookingLoading } = useBooking();
  const { rooms, isLoadingRooms, fetchRooms } = useRoomManagement();
  const { images, isLoading: imagesLoading, getRoomImages } = useRoomImages();
  
  // Memoize images to prevent unnecessary re-renders
  const memoizedImages = React.useMemo(() => images, [images]);
  
  // Enable automatic status checking every 5 minutes
  useBookingStatusChecker(5);
  
  // Conditional hooks based on room availability
  const roomIdNum = roomId ? parseInt(roomId) : 0;
  const { bookings, isLoading: calendarLoading, error: calendarError, refreshBookings, getBookingColor } = useRoomBookings(roomIdNum);
  const { checkTimeSlotAvailability } = useBookingConflictCheck();

  const handleSidebarToggle = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Image navigation functions - using useCallback to prevent unnecessary re-renders
  const handlePrevImage = React.useCallback(() => {
    if (memoizedImages.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? memoizedImages.length - 1 : prev - 1));
    }
  }, [memoizedImages.length]);

  const handleNextImage = React.useCallback(() => {
    if (memoizedImages.length > 0) {
      setCurrentImageIndex((prev) => (prev === memoizedImages.length - 1 ? 0 : prev + 1));
    }
  }, [memoizedImages.length]);

  // TAMBAHKAN FUNGSI INI (untuk navigasi dari sidebar)
  const handleMenuClick = (view: string) => {
    if (view === 'userManagement') {
      goToAdminDashboard();
    } else if (view === 'roomManagement') {
      goToRoomManagement();
    } else if (view === 'addBooking' || view === 'bookingHistory') {
      // Jika sudah di halaman booking, kembali ke pencarian
      goToSearch();
    } else {
      setActiveView(view);
    }
  };
  
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

  // Separate effect to load images when room is set
  useEffect(() => {
    const loadImages = async () => {
      if (room?.room_id && !imagesLoading && memoizedImages.length === 0) {
        try {
          await getRoomImages(room.room_id);
        } catch (error) {
          console.error('Failed to load room images:', error);
        }
      }
    };

    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.room_id, memoizedImages.length, imagesLoading]); // Intentionally excluding getRoomImages to avoid infinite loop

  // Reset current image index when images change
  useEffect(() => {
    if (memoizedImages.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [memoizedImages.length]); // Only depend on images length, not the entire array

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (memoizedImages.length <= 1) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handlePrevImage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNextImage();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [memoizedImages.length, handlePrevImage, handleNextImage]);

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

  // Ganti seluruh bagian 'return' dengan ini:
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
            title={`Room Details - ${room.room_name}`}
            userRole={getUserRoleForNavbar()}
            onMenuClick={handleSidebarToggle} // Ganti onBack menjadi onMenuClick
          />
          <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
            {/* KONTEN UTAMA ANDA DIMULAI DARI SINI */}
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              gap: 4
            }}>
              {/* Left Panel - Room Information */}
              <Box sx={{ flex: { lg: '0 0 400px' }, width: { xs: '100%', lg: '400px' } }}>
                <Paper sx={{ p: 3, height: 'fit-content', backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <Button
                    startIcon={<ArrowBack />}
                    onClick={handleBack}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  >
                    Back to Search
                  </Button>

                  {/* Image Carousel */}
                  <Box sx={{ mb: 3 }}>
                    {imagesLoading ? (
                      <Box sx={{ 
                        height: 250, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        borderRadius: 2,
                        border: '2px dashed #ddd'
                      }}>
                        <CircularProgress size={30} />
                        <Typography sx={{ ml: 2, color: 'text.secondary' }}>Loading images...</Typography>
                      </Box>
                    ) : memoizedImages && memoizedImages.length > 0 ? (
                      <Box sx={{ 
                        position: 'relative', 
                        borderRadius: 2, 
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        backgroundColor: '#000'
                      }}>
                        <CardMedia
                          component="img"
                          height="250"
                          image={memoizedImages[currentImageIndex]?.image_url}
                          alt={memoizedImages[currentImageIndex]?.image_name || `Room image ${currentImageIndex + 1}`}
                          sx={{
                            objectFit: 'cover',
                            width: '100%',
                            backgroundColor: '#f5f5f5',
                            transition: 'opacity 0.3s ease-in-out'
                          }}
                          onError={(e) => {
                            console.error('Image failed to load:', memoizedImages[currentImageIndex]?.image_url);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        
                        {/* Navigation arrows - always show if more than 1 image */}
                        {memoizedImages.length > 1 && (
                          <>
                            <IconButton
                              onClick={handlePrevImage}
                              sx={{
                                position: 'absolute',
                                left: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                width: 40,
                                height: 40,
                                '&:hover': {
                                  backgroundColor: 'rgba(0,0,0,0.8)',
                                  transform: 'translateY(-50%) scale(1.1)',
                                },
                                transition: 'all 0.2s ease'
                              }}
                              size="medium"
                            >
                              <ChevronLeft fontSize="large" />
                            </IconButton>
                            <IconButton
                              onClick={handleNextImage}
                              sx={{
                                position: 'absolute',
                                right: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                width: 40,
                                height: 40,
                                '&:hover': {
                                  backgroundColor: 'rgba(0,0,0,0.8)',
                                  transform: 'translateY(-50%) scale(1.1)',
                                },
                                transition: 'all 0.2s ease'
                              }}
                              size="medium"
                            >
                              <ChevronRight fontSize="large" />
                            </IconButton>
                          </>
                        )}

                        {/* Image indicators - only show if more than 1 image */}
                        {memoizedImages.length > 1 && (
                          <Box sx={{
                            position: 'absolute',
                            bottom: 12,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: 1,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            padding: '6px 12px',
                            borderRadius: 3
                          }}>
                            {memoizedImages.map((_, index) => (
                              <Box
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  backgroundColor: index === currentImageIndex 
                                    ? 'white' 
                                    : 'rgba(255,255,255,0.4)',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    backgroundColor: index === currentImageIndex 
                                      ? 'white' 
                                      : 'rgba(255,255,255,0.7)',
                                    transform: 'scale(1.2)'
                                  }
                                }}
                              />
                            ))}
                          </Box>
                        )}

                        {/* Image counter */}
                        <Box sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: 2,
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          backdropFilter: 'blur(4px)'
                        }}>
                          {currentImageIndex + 1} / {memoizedImages.length}
                        </Box>

                        {/* Primary indicator */}
                        {memoizedImages[currentImageIndex]?.is_primary && (
                          <Box sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            backgroundColor: 'rgba(76, 175, 80, 0.9)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backdropFilter: 'blur(4px)'
                          }}>
                            PRIMARY
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ 
                        height: 250, 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: '#f8f9fa',
                        borderRadius: 2,
                        color: 'text.secondary',
                        border: '2px dashed #ddd'
                      }}>
                        <ImageNotSupported sx={{ fontSize: 48, mb: 2, color: 'text.disabled' }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>No images available</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>Room images will appear here</Typography>
                      </Box>
                    )}
                  </Box>
                  {/* ... Sisa konten panel kiri (tidak berubah) ... */}
                   <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" component="h1" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {room.room_name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {room.location}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  {/* ... (lanjutan kode panel kiri) */}
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
                </Paper>
              </Box>

              {/* Right Panel - Calendar */}
              <Box sx={{ flex: 1 }}>
                {/* ... Konten panel kanan (tidak berubah) ... */}
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
            </Box>
            {/* KONTEN UTAMA ANDA BERAKHIR DI SINI */}

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
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default BookRoom;
