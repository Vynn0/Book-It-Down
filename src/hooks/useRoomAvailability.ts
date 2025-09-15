import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { DateTimeUtils } from '../utils/dateUtils';

export interface BookingSlot {
  booking_id: number;
  start_datetime: string;
  end_datetime: string;
  user_id: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | null;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  isAvailable: boolean;
  bookingInfo?: BookingSlot;
}

export function useRoomAvailability(roomId: number, selectedDate: Date | null) {
  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch bookings for the selected date
  const fetchBookings = async () => {
    if (!selectedDate || !roomId) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // Get start and end of the selected day in UTC
      const startOfDay = DateTimeUtils.getStartOfDay(selectedDate);
      const endOfDay = DateTimeUtils.getEndOfDay(selectedDate);

      console.log('Fetching bookings for room:', roomId, 'on date:', DateTimeUtils.formatDate(selectedDate));

      const { data, error: fetchError } = await supabase
        .from('booking')
        .select('booking_id, start_datetime, end_datetime, user_id, status')
        .eq('room_id', roomId)
        .gte('start_datetime', startOfDay.toISOString())
        .lte('start_datetime', endOfDay.toISOString())
        .in('status', ['Pending', 'Approved']); // Only consider active bookings

      if (fetchError) {
        console.error('Error fetching bookings:', fetchError);
        setError('Failed to fetch room availability');
        setBookings([]);
        return;
      }

      console.log('Found bookings:', data);
      setBookings(data || []);
    } catch (err) {
      console.error('Unexpected error fetching bookings:', err);
      setError('An unexpected error occurred');
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate 30-minute time slots for the day (8 AM to 6 PM)
  const generateTimeSlots = () => {
    if (!selectedDate) {
      setTimeSlots([]);
      return;
    }

    const slots: TimeSlot[] = [];
    const startHour = 8; // 8 AM
    const endHour = 18; // 6 PM (18:00)

    // Generate slots every 30 minutes
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Create slot start time in Jakarta timezone
        const slotStart = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          hour,
          minute,
          0,
          0
        );
        
        // Create slot end time (30 minutes later)
        const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);

        // Check if this slot conflicts with any booking
        const conflictingBooking = bookings.find(booking => {
          const bookingStart = DateTimeUtils.fromUTC(booking.start_datetime);
          const bookingEnd = DateTimeUtils.fromUTC(booking.end_datetime);
          
          // Check for any overlap between slot and booking
          return (slotStart < bookingEnd && slotEnd > bookingStart);
        });

        slots.push({
          start: slotStart,
          end: slotEnd,
          isAvailable: !conflictingBooking,
          bookingInfo: conflictingBooking
        });
      }
    }

    console.log(`Generated ${slots.length} time slots, ${slots.filter(s => !s.isAvailable).length} unavailable`);
    setTimeSlots(slots);
  };

  // Check if a time range is completely available
  const isTimeRangeAvailable = (startTime: Date, endTime: Date): boolean => {
    if (!startTime || !endTime) return false;
    
    // Check duration limit (2 hours max)
    const durationMinutes = DateTimeUtils.getDurationMinutes(startTime, endTime);
    if (durationMinutes > 120) { // 2 hours = 120 minutes
      return false;
    }

    // Check if all 30-minute slots in the range are available
    return timeSlots.every(slot => {
      const slotOverlaps = slot.start < endTime && slot.end > startTime;
      return !slotOverlaps || slot.isAvailable;
    });
  };

  // Get bookings that overlap with a given time range
  const getConflictingBookings = (startTime: Date, endTime: Date): BookingSlot[] => {
    return bookings.filter(booking => {
      const bookingStart = DateTimeUtils.fromUTC(booking.start_datetime);
      const bookingEnd = DateTimeUtils.fromUTC(booking.end_datetime);
      
      return (startTime < bookingEnd && endTime > bookingStart);
    });
  };

  // Fetch bookings when room or date changes
  useEffect(() => {
    fetchBookings();
  }, [roomId, selectedDate]);

  // Generate time slots when bookings or date changes
  useEffect(() => {
    generateTimeSlots();
  }, [bookings, selectedDate]);

  return {
    bookings,
    timeSlots,
    isLoading,
    error,
    isTimeRangeAvailable,
    getConflictingBookings,
    refreshAvailability: fetchBookings
  };
}