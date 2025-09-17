import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { DateTimeUtils } from '../utils/dateUtils';

export interface CalendarBooking {
  booking_id: number;
  title: string;
  start: string;
  end: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  user_name?: string;
}

export function useRoomBookings(roomId: number) {
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoomBookings = async () => {
    if (!roomId) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching bookings for room:', roomId);

      // Fetch bookings with user information
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('booking')
        .select(`
          booking_id,
          start_datetime,
          end_datetime,
          status,
          user:user_id (
            name,
            email
          )
        `)
        .eq('room_id', roomId)
        .neq('status', 'Cancelled')
        .neq('status', 'Rejected')
        .order('start_datetime', { ascending: true });

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        setError('Failed to fetch bookings');
        return;
      }

      // Transform data for FullCalendar
      const calendarEvents: CalendarBooking[] = (bookingsData || []).map((booking: any) => {
        const startLocal = DateTimeUtils.fromUTC(booking.start_datetime);
        const endLocal = DateTimeUtils.fromUTC(booking.end_datetime);
        
        return {
          booking_id: booking.booking_id,
          title: getBookingTitle(booking.status),
          start: startLocal.toISOString(),
          end: endLocal.toISOString(),
          status: booking.status as 'Pending' | 'Approved' | 'Rejected' | 'Cancelled',
          user_name: booking.user?.name || 'Unknown User'
        };
      });

      setBookings(calendarEvents);
      console.log('Fetched calendar events:', calendarEvents);
    } catch (err) {
      console.error('Unexpected error fetching bookings:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getBookingTitle = (status: string): string => {
    switch (status) {
      case 'Approved':
        return 'Dipesan';
      case 'Pending':
        return 'Menunggu Persetujuan';
      case 'Rejected':
        return 'Ditolak';
      case 'Cancelled':
        return 'Dibatalkan';
      default:
        return 'Booking';
    }
  };

  const getBookingColor = (status: string): string => {
    switch (status) {
      case 'Approved':
        return '#28a745'; // Green for approved
      case 'Pending':
        return '#ffc107'; // Yellow for pending
      case 'Rejected':
        return '#dc3545'; // Red for rejected
      case 'Cancelled':
        return '#6c757d'; // Gray for cancelled
      default:
        return '#007bff'; // Blue default
    }
  };

  // Fetch bookings when component mounts or roomId changes
  useEffect(() => {
    fetchRoomBookings();
  }, [roomId]);

  return {
    bookings,
    isLoading,
    error,
    refreshBookings: fetchRoomBookings,
    getBookingColor
  };
}