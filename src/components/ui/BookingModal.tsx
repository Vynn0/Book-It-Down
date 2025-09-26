import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  IconButton,
  TextField
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { 
  Close, 
  Schedule, 
  CalendarToday, 
  CheckCircle, 
  Warning 
} from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { DateTimeUtils } from '../../utils/dateUtils';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  roomId: number;
  roomName: string;
  onBookingConfirm: (startTime: Date, endTime: Date, title: string) => Promise<{ success: boolean; error?: string }>;
  onCheckAvailability: (roomId: number, startTime: Date, endTime: Date) => Promise<boolean>;
  isBookingInProgress?: boolean;
}

export function BookingModal({
  open,
  onClose,
  selectedDate,
  roomId,
  roomName,
  onBookingConfirm,
  onCheckAvailability,
  isBookingInProgress = false
}: BookingModalProps) {
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [title, setTitle] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Reset form when modal opens/closes or date changes
  useEffect(() => {
    if (open && selectedDate) {
      // Set default times (e.g., 9:00 AM - 10:00 AM)
      const defaultStart = dayjs(selectedDate).hour(9).minute(0).second(0);
      const defaultEnd = dayjs(selectedDate).hour(10).minute(0).second(0);
      setStartTime(defaultStart);
      setEndTime(defaultEnd);
      setTitle(''); // Reset title
    } else {
      setStartTime(null);
      setEndTime(null);
      setTitle('');
    }
    setAvailabilityError(null);
    setBookingError(null);
    setIsAvailable(null);
  }, [open, selectedDate]);

  const handleStartTimeChange = (newTime: Dayjs | null) => {
    setStartTime(newTime);
    setIsAvailable(null);
    setAvailabilityError(null);
    
    // Auto-adjust end time if it's before start time
    if (newTime && endTime && newTime.isAfter(endTime)) {
      setEndTime(newTime.add(1, 'hour'));
    }
  };

  const handleEndTimeChange = (newTime: Dayjs | null) => {
    setEndTime(newTime);
    setIsAvailable(null);
    setAvailabilityError(null);
  };

  const checkAvailability = async () => {
    if (!startTime || !endTime || !selectedDate) return;

    if (endTime.isBefore(startTime) || endTime.isSame(startTime)) {
      setAvailabilityError('End time must be after start time');
      setIsAvailable(false);
      return;
    }

    const duration = endTime.diff(startTime, 'minute');
    if (duration > 120) { // 2 hours max
      setAvailabilityError('Maximum booking duration is 2 hours');
      setIsAvailable(false);
      return;
    }

    // Check if the selected date is in the past
    if (DateTimeUtils.isPastDate(selectedDate)) {
      setAvailabilityError('Cannot book rooms for past dates. Please select a current or future date.');
      setIsAvailable(false);
      return;
    }

    // Create the start datetime to check if it's in the past
    const startDateTime = dayjs(selectedDate)
      .hour(startTime.hour())
      .minute(startTime.minute())
      .toDate();

    // Check if the start time is in the past
    if (DateTimeUtils.isPastDateTime(startDateTime)) {
      setAvailabilityError('Cannot book rooms for past times. Please select a current or future time.');
      setIsAvailable(false);
      return;
    }

    setIsChecking(true);
    setAvailabilityError(null);

    try {
      const endDateTime = dayjs(selectedDate)
        .hour(endTime.hour())
        .minute(endTime.minute())
        .toDate();

      const available = await onCheckAvailability(roomId, startDateTime, endDateTime);
      setIsAvailable(available);
      
      if (!available) {
        setAvailabilityError('This time slot is already booked. Please choose a different time.');
      }
    } catch (error) {
      setAvailabilityError('Failed to check availability. Please try again.');
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleBooking = async () => {
    if (!startTime || !endTime || !selectedDate || !isAvailable || !title.trim()) {
      setBookingError('Please fill in all fields including the booking title and check availability');
      return;
    }

    setBookingError(null);

    // Additional validation before booking
    if (DateTimeUtils.isPastDate(selectedDate)) {
      setBookingError('Cannot book rooms for past dates. Please select a current or future date.');
      return;
    }

    const startDateTime = dayjs(selectedDate)
      .hour(startTime.hour())
      .minute(startTime.minute())
      .toDate();

    if (DateTimeUtils.isPastDateTime(startDateTime)) {
      setBookingError('Cannot book rooms for past times. Please select a current or future time.');
      return;
    }

    try {
      const endDateTime = dayjs(selectedDate)
        .hour(endTime.hour())
        .minute(endTime.minute())
        .toDate();

      const result = await onBookingConfirm(startDateTime, endDateTime, title.trim());
      
      if (result.success) {
        onClose();
      } else {
        setBookingError(result.error || 'Failed to book room');
      }
    } catch (error) {
      setBookingError('An unexpected error occurred while booking');
    }
  };

  const handleClose = () => {
    if (!isBookingInProgress) {
      onClose();
    }
  };

  const getDurationText = () => {
    if (!startTime || !endTime) return '';
    const duration = endTime.diff(startTime, 'minute');
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  const canCheckAvailability = startTime && endTime && !isChecking && !isBookingInProgress;
  const canBook = isAvailable && !isBookingInProgress && !isChecking;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday color="primary" />
              <Typography variant="h6" component="span">
                Book {roomName}
              </Typography>
            </Box>
            <IconButton
              onClick={handleClose}
              disabled={isBookingInProgress}
              size="small"
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Selected Date Display */}
          <Paper sx={{ p: 2, mb: 3, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Selected Date: {selectedDate ? DateTimeUtils.formatDate(selectedDate) : 'No date selected'}
            </Typography>
          </Paper>

          {/* Time Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule color="primary" />
              Select Time
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TimePicker
                label="Start Time"
                value={startTime}
                onChange={(newTime) => handleStartTimeChange(newTime ? dayjs(newTime) : null)}
                ampm={false}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined'
                  }
                }}
              />
              
              <TimePicker
                label="End Time"
                value={endTime}
                onChange={(newTime) => handleEndTimeChange(newTime ? dayjs(newTime) : null)}
                ampm={false}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined'
                  }
                }}
              />
            </Box>

            {/* Duration Display */}
            {startTime && endTime && (
              <Typography variant="body2" color="text.secondary">
                Duration: {getDurationText()}
              </Typography>
            )}
          </Box>

          {/* Booking Title Input */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday color="primary" />
              Booking Title
            </Typography>
            <TextField
              fullWidth
              label="What is this meeting about?"
              placeholder="e.g., Team Meeting, Client Presentation, Workshop"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
              multiline
              rows={2}
              inputProps={{ maxLength: 255 }}
              helperText={`${title.length}/255 characters`}
              sx={{ mb: 1 }}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Check Availability Button */}
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={checkAvailability}
              disabled={!canCheckAvailability}
              startIcon={isChecking ? <CircularProgress size={20} /> : <CheckCircle />}
              sx={{ py: 1.5 }}
            >
              {isChecking ? 'Checking Availability...' : 'Check Availability'}
            </Button>
          </Box>

          {/* Availability Status */}
          {isAvailable === true && (
            <Alert severity="success" sx={{ mb: 2 }}>
              ✅ Time slot is available! You can proceed with booking.
            </Alert>
          )}

          {availabilityError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning />
                {availabilityError}
              </Box>
            </Alert>
          )}

          {bookingError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {bookingError}
            </Alert>
          )}

          {/* Booking Summary */}
          {startTime && endTime && isAvailable && (
            <Paper sx={{ p: 2, backgroundColor: 'success.light', color: 'success.contrastText' }}>
              <Typography variant="subtitle1" gutterBottom>
                Booking Summary
              </Typography>
              <Typography variant="body2">
                <strong>Room:</strong> {roomName}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong> {selectedDate ? DateTimeUtils.formatDate(selectedDate) : ''}
              </Typography>
              <Typography variant="body2">
                <strong>Time:</strong> {startTime.format('HH:mm')} - {endTime.format('HH:mm')}
              </Typography>
              <Typography variant="body2">
                <strong>Duration:</strong> {getDurationText()}
              </Typography>
            </Paper>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleClose}
            disabled={isBookingInProgress}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleBooking}
            disabled={!canBook}
            variant="contained"
            startIcon={isBookingInProgress ? <CircularProgress size={20} /> : <CheckCircle />}
          >
            {isBookingInProgress ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}