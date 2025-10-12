import { useState } from 'react';
import { supabase } from '../../utils/supabase';
import { DateTimeUtils } from '../../utils/dateUtils';

export interface BookingConflict {
  booking_id: number;
  start_datetime: string;
  end_datetime: string;
  user_id: number;
  status: string;
  user_name?: string;
}

export function useBookingConflictCheck() {
  const [isChecking, setIsChecking] = useState(false);

  const checkTimeSlotAvailability = async (
    roomId: number,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> => {
    setIsChecking(true);
    
    try {
      console.log('Checking availability for room:', roomId);
      console.log('Time range:', DateTimeUtils.formatTime(startTime), '-', DateTimeUtils.formatTime(endTime));
      console.log('Start time ISO:', startTime.toISOString());
      console.log('End time ISO:', endTime.toISOString());

      // Query database for overlapping bookings - simplified approach
      const { data: allBookings, error } = await supabase
        .from('booking')
        .select(`
          booking_id,
          start_datetime,
          end_datetime,
          user_id,
          status
        `)
        .eq('room_id', roomId)
        .in('status', ['Pending', 'Approved']); // Only consider active bookings (excludes Cancelled, Rejected, Expired)

      if (error) {
        console.error('Error checking booking conflicts:', error);
        throw new Error('Failed to check room availability');
      }

      // Filter for overlapping bookings in JavaScript
      const conflictingBookings = (allBookings || []).filter(booking => {
        const bookingStart = new Date(booking.start_datetime);
        const bookingEnd = new Date(booking.end_datetime);
        
        // Check for overlap: booking overlaps if it starts before our end time AND ends after our start time
        return bookingStart < endTime && bookingEnd > startTime;
      });

      console.log('Found conflicting bookings:', conflictingBookings);

      // Return true if no conflicts (available), false if conflicts exist
      return !conflictingBookings || conflictingBookings.length === 0;
    } catch (error) {
      console.error('Error in checkTimeSlotAvailability:', error);
      throw error;
    } finally {
      setIsChecking(false);
    }
  };

  const getConflictingBookings = async (
    roomId: number,
    startTime: Date,
    endTime: Date
  ): Promise<BookingConflict[]> => {
    try {
      const { data: allBookings, error } = await supabase
        .from('booking')
        .select(`
          booking_id,
          start_datetime,
          end_datetime,
          user_id,
          status,
          profiles!user_id (
            full_name
          )
        `)
        .eq('room_id', roomId)
        .in('status', ['Pending', 'Approved']); // Only consider active bookings (excludes Cancelled, Rejected, Expired)

      if (error) {
        console.error('Error fetching conflicting bookings:', error);
        return [];
      }

      // Filter for overlapping bookings
      const conflictingBookings = (allBookings || []).filter(booking => {
        const bookingStart = new Date(booking.start_datetime);
        const bookingEnd = new Date(booking.end_datetime);
        
        return bookingStart < endTime && bookingEnd > startTime;
      });

      return conflictingBookings.map(booking => ({
        ...booking,
        user_name: (booking.profiles as any)?.full_name || 'Unknown User'
      }));
    } catch (error) {
      console.error('Error getting conflicting bookings:', error);
      return [];
    }
  };

  return {
    checkTimeSlotAvailability,
    getConflictingBookings,
    isChecking
  };
}