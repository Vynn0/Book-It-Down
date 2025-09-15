import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { CalendarToday, Schedule, CheckCircle } from '@mui/icons-material';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { TimeSlotPicker } from './TimeSlotPicker';
import { useRoomAvailability } from '../../hooks/useRoomAvailability';
import { DateTimeUtils } from '../../utils/dateUtils';

interface BookingCalendarProps {
  roomId: number;
  roomName: string;
  onBookingConfirm: (startTime: Date, endTime: Date) => void;
  isBookingInProgress?: boolean;
  disabledDates?: Date[];
}

export function BookingCalendar({ 
  roomId, 
  roomName, 
  onBookingConfirm, 
  isBookingInProgress = false,
  disabledDates = []
}: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState<Date | undefined>();
  const [selectedEndTime, setSelectedEndTime] = useState<Date | undefined>();

  const { 
    timeSlots, 
    isLoading, 
    error, 
    isTimeRangeAvailable 
  } = useRoomAvailability(roomId, selectedDate);

  const handleDateChange = (newDate: any) => {
    if (newDate && dayjs.isDayjs(newDate) && newDate.isValid()) {
      setSelectedDate(newDate.toDate());
      // Reset time selection when date changes
      setSelectedStartTime(undefined);
      setSelectedEndTime(undefined);
    } else if (newDate instanceof Date) {
      setSelectedDate(newDate);
      setSelectedStartTime(undefined);
      setSelectedEndTime(undefined);
    }
  };

  const handleTimeSelect = (startTime: Date, endTime: Date) => {
    setSelectedStartTime(startTime);
    setSelectedEndTime(endTime);
  };

  const handleConfirmBooking = () => {
    if (selectedStartTime && selectedEndTime && canConfirmBooking) {
      onBookingConfirm(selectedStartTime, selectedEndTime);
    }
  };

  const handleResetSelection = () => {
    setSelectedStartTime(undefined);
    setSelectedEndTime(undefined);
  };

  const canConfirmBooking = selectedStartTime && 
    selectedEndTime && 
    isTimeRangeAvailable(selectedStartTime, selectedEndTime) &&
    !isBookingInProgress;

  const isDateDisabled = (date: Date | Dayjs) => {
    const dateObj = dayjs.isDayjs(date) ? date : dayjs(date);
    const today = dayjs();
    // Disable past dates
    if (dateObj.isBefore(today, 'day')) return true;
    
    // Disable custom disabled dates
    return disabledDates.some(disabledDate => 
      dayjs(disabledDate).isSame(dateObj, 'day')
    );
  };

  const getSelectedDuration = () => {
    if (!selectedStartTime || !selectedEndTime) return null;
    const minutes = DateTimeUtils.getDurationMinutes(selectedStartTime, selectedEndTime);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0 && remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${remainingMinutes}m`;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 2 }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday color="primary" />
            Book {roomName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select a date and time slots to book this room. Maximum booking duration is 2 hours.
          </Typography>
        </Paper>

        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' } }}>
          {/* Date Selection */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday />
                Select Date
              </Typography>
              
              <DatePicker
                label="Booking Date"
                value={selectedDate ? dayjs(selectedDate) : null}
                onChange={handleDateChange}
                shouldDisableDate={isDateDisabled}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined'
                  }
                }}
              />

              {selectedDate && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="primary">
                    <strong>Selected Date:</strong>
                  </Typography>
                  <Typography variant="body1">
                    {DateTimeUtils.formatDate(selectedDate)}
                  </Typography>
                </Box>
              )}

              {/* Booking Summary */}
              {selectedStartTime && selectedEndTime && (
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="h6" gutterBottom color="success.main">
                    Booking Summary
                  </Typography>
                  <Box sx={{ p: 2, backgroundColor: 'success.light', borderRadius: 1, color: 'success.contrastText' }}>
                    <Typography variant="body2">
                      <strong>Date:</strong> {DateTimeUtils.formatDate(selectedDate!)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Time:</strong> {DateTimeUtils.formatTime(selectedStartTime)} - {DateTimeUtils.formatTime(selectedEndTime)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Duration:</strong> {getSelectedDuration()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={handleConfirmBooking}
                      disabled={!canConfirmBooking}
                      fullWidth
                    >
                      {isBookingInProgress ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleResetSelection}
                      disabled={isBookingInProgress}
                    >
                      Reset
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Time Selection */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule />
                Select Time Slots
              </Typography>

              {!selectedDate ? (
                <Alert severity="info">
                  Please select a date first to view available time slots.
                </Alert>
              ) : error ? (
                <Alert severity="error">
                  {error}
                </Alert>
              ) : isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>Loading available time slots...</Typography>
                </Box>
              ) : (
                <TimeSlotPicker
                  timeSlots={timeSlots}
                  selectedStartTime={selectedStartTime}
                  selectedEndTime={selectedEndTime}
                  onTimeSelect={handleTimeSelect}
                  maxDurationHours={2}
                  isLoading={isLoading}
                />
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Booking Instructions */}
        <Paper sx={{ mt: 3, p: 2, backgroundColor: 'info.light' }}>
          <Typography variant="subtitle2" gutterBottom color="info.contrastText">
            📋 Booking Instructions:
          </Typography>
          <Typography variant="body2" color="info.contrastText">
            1. Select your desired booking date from the calendar<br />
            2. Choose your start time by clicking on an available time slot<br />
            3. Choose your end time by clicking on another available time slot<br />
            4. Review your booking summary and click "Confirm Booking"<br />
            5. Your booking will be submitted for approval
          </Typography>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}