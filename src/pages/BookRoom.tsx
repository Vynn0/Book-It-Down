import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CssBaseline,
  Button,
  Paper,
  Divider,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { appTheme } from '../services';
import { ArrowBack, CalendarToday, Info, CheckCircle } from '@mui/icons-material';
import { Navbar } from '../components/ui';
import { useAuth, useBooking } from '../hooks';

interface Room {
  room_id: number;
  room_name: string;
  location: string;
  capacity: number;
  description: string;
  created_at: string;
  features?: string[];
}

interface BookRoomProps {
  room: Room;
  onBack: () => void;
}

const BookRoom: React.FC<BookRoomProps> = ({ room, onBack }) => {
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const { hasRole } = useAuth();
  const { createQuickBooking, isLoading } = useBooking();

  const handleBookRoom = async () => {
    setBookingError(null);
    setBookingSuccess(false);
    
    const result = await createQuickBooking(room.room_id);
    
    if (result.success) {
      setBookingSuccess(true);
    } else {
      setBookingError(result.error || 'Failed to book room');
    }
  };

  // Get user roles for navbar display
  const getUserRoleForNavbar = (): 'employee' | 'administrator' => {
    if (hasRole(1)) return 'administrator'; // Role ID 1 is admin
    return 'employee';
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar
          title={`Book Room - ${room.room_name}`}
          onBack={onBack}
          userRole={getUserRoleForNavbar()}
        />

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          {/* Back Button */}
          <Button
            startIcon={<ArrowBack />}
            onClick={onBack}
            variant="outlined"
            sx={{ mb: 3 }}
          >
            Back to Rooms
          </Button>

          {/* Room Details Section */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <IconButton
                edge="start"
                color="inherit"
                onClick={onBack}
                aria-label="go back"
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="h4" component="h1" color="secondary" gutterBottom>
                  {room.room_name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {room.location} • Capacity: {room.capacity} people
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {/* Room Information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info /> Room Information
              </Typography>
              
              {room.description && (
                <Typography variant="body1" paragraph>
                  {room.description}
                </Typography>
              )}
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mt: 2 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="h6">
                      {room.location}
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Capacity
                    </Typography>
                    <Typography variant="h6">
                      {room.capacity} People
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Features Section */}
              {room.features && room.features.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Available Features:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {room.features.map((feature, index) => (
                      <Box
                        key={index}
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: '20px',
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText',
                          fontSize: '0.875rem',
                          fontWeight: 'medium'
                        }}
                      >
                        {feature}
                      </Box>
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

            {/* Booking Action */}
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CalendarToday />}
                onClick={handleBookRoom}
                disabled={isLoading || bookingSuccess}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                {isLoading ? 'Booking...' : bookingSuccess ? 'Room Booked!' : 'Book This Room'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default BookRoom;