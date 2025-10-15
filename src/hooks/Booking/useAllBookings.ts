import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../utils/supabase';
import { BookingStatusManager } from '../../utils/bookingStatusManager';

export interface AdminBooking {
  booking_id: number;
  user_id: number;
  room_id: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Completed' | 'Expired' | null;
  start_datetime: string;
  end_datetime: string;
  created_at: string;
  user_name?: string;
  room_name?: string;
}

export function useAllBookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching all bookings for admin dashboard');

      // First, update booking statuses based on current time (Pending→Approved, Expired bookings)
      await BookingStatusManager.performStatusCheck();

      // Fetch all bookings with user and room information
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('booking')
        .select(`
          booking_id,
          user_id,
          room_id,
          status,
          start_datetime,
          end_datetime,
          created_at,
          user:user_id (
            name
          ),
          room:room_id (
            room_name
          )
        `)
        .in('status', ['Pending', 'Approved'])
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('Error fetching all bookings:', bookingsError);
        setError('Failed to fetch bookings');
        return;
      }

      // Transform data to include user and room names
      const transformedBookings: AdminBooking[] = (bookingsData || []).map((booking: any) => ({
        booking_id: booking.booking_id,
        user_id: booking.user_id,
        room_id: booking.room_id,
        status: booking.status,
        start_datetime: booking.start_datetime,
        end_datetime: booking.end_datetime,
        created_at: booking.created_at,
        user_name: booking.user?.name || 'Unknown User',
        room_name: booking.room?.room_name || 'Unknown Room'
      }));

      setBookings(transformedBookings);
      console.log(`Fetched ${transformedBookings.length} pending/approved bookings`);
    } catch (err) {
      console.error('Unexpected error fetching bookings:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  // Get count of active bookings (pending + approved)
  const getActiveBookingsCount = useCallback((): number => {
    return bookings.filter(booking =>
      booking.status === 'Pending' || booking.status === 'Approved'
    ).length;
  }, [bookings]);

  // Get count of today's bookings
  const getTodayBookingsCount = useCallback((): number => {
    const today = new Date();
    const todayStr = today.toDateString();

    return bookings.filter(booking => {
      const bookingDate = new Date(booking.start_datetime);
      return bookingDate.toDateString() === todayStr &&
        (booking.status === 'Pending' || booking.status === 'Approved');
    }).length;
  }, [bookings]);

  return {
    bookings,
    isLoading,
    error,
    refetchBookings: fetchAllBookings,
    getActiveBookingsCount,
    getTodayBookingsCount
  };
}