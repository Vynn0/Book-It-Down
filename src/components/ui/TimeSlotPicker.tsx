import { useState } from 'react';
import {
  Box,
  Chip,
  Typography,
  Alert,
  Button,
  Paper,
  Tooltip
} from '@mui/material';
import { AccessTime, Block, CheckCircle } from '@mui/icons-material';
import type { TimeSlot } from '../../hooks/useRoomAvailability';
import { DateTimeUtils } from '../../utils/dateUtils';

interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  selectedStartTime?: Date;
  selectedEndTime?: Date;
  onTimeSelect: (startTime: Date, endTime: Date) => void;
  maxDurationHours?: number;
  isLoading?: boolean;
}

export function TimeSlotPicker({
  timeSlots,
  selectedStartTime,
  selectedEndTime,
  onTimeSelect,
  maxDurationHours = 2,
  isLoading = false
}: TimeSlotPickerProps) {
  const [selectingStart, setSelectingStart] = useState(true);
  const [tempStartTime, setTempStartTime] = useState<Date | null>(null);

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.isAvailable || isLoading) return;

    if (selectingStart || !tempStartTime) {
      // Selecting start time
      setTempStartTime(slot.start);
      setSelectingStart(false);
    } else {
      // Selecting end time
      const duration = DateTimeUtils.getDurationMinutes(tempStartTime, slot.end) / 60;
      
      if (duration > maxDurationHours) {
        alert(`Maximum booking duration is ${maxDurationHours} hours`);
        return;
      }

      if (slot.start <= tempStartTime) {
        alert('End time must be after start time');
        return;
      }

      // Check if all slots between start and end are available
      const isRangeAvailable = timeSlots.every(timeSlot => {
        const slotOverlaps = timeSlot.start < slot.end && timeSlot.end > tempStartTime;
        return !slotOverlaps || timeSlot.isAvailable;
      });

      if (!isRangeAvailable) {
        alert('Selected time range contains unavailable slots');
        return;
      }

      onTimeSelect(tempStartTime, slot.end);
      setSelectingStart(true);
      setTempStartTime(null);
    }
  };

  const resetSelection = () => {
    setTempStartTime(null);
    setSelectingStart(true);
  };

  const getSlotColor = (slot: TimeSlot): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    if (!slot.isAvailable) return 'error';
    if (tempStartTime && slot.start.getTime() === tempStartTime.getTime()) return 'primary';
    if (selectedStartTime && selectedEndTime) {
      if (slot.start >= selectedStartTime && slot.end <= selectedEndTime) return 'success';
    }
    return 'default';
  };

  const getSlotVariant = (slot: TimeSlot): 'filled' | 'outlined' => {
    if (!slot.isAvailable) return 'filled';
    if (tempStartTime && slot.start.getTime() === tempStartTime.getTime()) return 'filled';
    if (selectedStartTime && selectedEndTime) {
      if (slot.start >= selectedStartTime && slot.end <= selectedEndTime) return 'filled';
    }
    return 'outlined';
  };

  const getSlotIcon = (slot: TimeSlot) => {
    if (!slot.isAvailable) return <Block sx={{ fontSize: '16px' }} />;
    if (tempStartTime && slot.start.getTime() === tempStartTime.getTime()) return <AccessTime sx={{ fontSize: '16px' }} />;
    if (selectedStartTime && selectedEndTime && slot.start >= selectedStartTime && slot.end <= selectedEndTime) {
      return <CheckCircle sx={{ fontSize: '16px' }} />;
    }
    return <AccessTime sx={{ fontSize: '16px' }} />;
  };

  const getTooltipContent = (slot: TimeSlot) => {
    if (!slot.isAvailable && slot.bookingInfo) {
      return `Booked (ID: ${slot.bookingInfo.booking_id}) - ${slot.bookingInfo.status}`;
    }
    if (!slot.isAvailable) {
      return 'Time slot unavailable';
    }
    return `${DateTimeUtils.formatTime(slot.start)} - ${DateTimeUtils.formatTime(slot.end)}`;
  };

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>Loading time slots...</Typography>
      </Box>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <Alert severity="info">
        No time slots available for the selected date.
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccessTime />
        Select Time Slots
      </Typography>
      
      <Alert severity={selectingStart || !tempStartTime ? 'info' : 'success'} sx={{ mb: 2 }}>
        {selectingStart || !tempStartTime
          ? '🕐 Step 1: Click to select start time'
          : `🎯 Step 2: Click to select end time (Started at ${DateTimeUtils.formatTime(tempStartTime)})`}
      </Alert>

      {tempStartTime && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="primary">
            <strong>Selected start:</strong> {DateTimeUtils.formatTime(tempStartTime)}
          </Typography>
          <Button size="small" variant="outlined" onClick={resetSelection}>
            Reset Selection
          </Button>
        </Box>
      )}

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 1
      }}>
        {timeSlots.map((slot, index) => (
          <Tooltip key={index} title={getTooltipContent(slot)} arrow>
            <span>
              <Chip
                icon={getSlotIcon(slot)}
                label={DateTimeUtils.formatTime(slot.start)}
                onClick={() => handleSlotClick(slot)}
                color={getSlotColor(slot)}
                variant={getSlotVariant(slot)}
                disabled={!slot.isAvailable}
                sx={{
                  width: '100%',
                  cursor: slot.isAvailable ? 'pointer' : 'not-allowed',
                  '&:hover': {
                    backgroundColor: slot.isAvailable ? 'primary.light' : undefined,
                    transform: slot.isAvailable ? 'scale(1.02)' : undefined
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              />
            </span>
          </Tooltip>
        ))}
      </Box>

      {/* Legend */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Legend:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip size="small" variant="outlined" label="Available" />
            <Typography variant="caption">- Click to select</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip size="small" color="error" variant="filled" label="Booked" />
            <Typography variant="caption">- Unavailable</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip size="small" color="primary" variant="filled" label="Start" />
            <Typography variant="caption">- Selected start time</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip size="small" color="success" variant="filled" label="Range" />
            <Typography variant="caption">- Selected time range</Typography>
          </Box>
        </Box>
      </Box>

      {selectedStartTime && selectedEndTime && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <strong>Selected booking time:</strong><br />
          {DateTimeUtils.formatLocal(selectedStartTime, 'HH:mm')} - {DateTimeUtils.formatLocal(selectedEndTime, 'HH:mm')} 
          <br />
          <em>Duration: {DateTimeUtils.getDurationMinutes(selectedStartTime, selectedEndTime)} minutes</em>
        </Alert>
      )}
    </Paper>
  );
}