import { useState, useCallback } from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../useAuth';
import { DateTimeUtils } from '../../utils/dateUtils';
import { BookingStatusManager } from '../../utils/bookingStatusManager';

export interface Booking {
  booking_id: number;
  user_id: number;
  room_id: number;
  title: string; // Added title field
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Completed' | 'Expired' | null;
  start_datetime: string;
  end_datetime: string;
  created_at: string;
}

export interface CreateBookingData {
  room_id: number;
  title: string; // Added title field
  start_datetime: string;
  end_datetime: string;
  status?: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Completed' | 'Expired';
}

export function useBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createBooking = async (bookingData: CreateBookingData): Promise<{ success: boolean; booking?: Booking; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate booking times
      const startTime = new Date(bookingData.start_datetime);
      const endTime = new Date(bookingData.end_datetime);

      // Check if start time is before end time
      if (startTime >= endTime) {
        return { success: false, error: 'Start time must be before end time' };
      }

      // Check if booking is not in the past (using timezone-aware validation)
      if (DateTimeUtils.isPastDateTime(startTime)) {
        return { success: false, error: 'Cannot book rooms in the past. Please select a current or future time.' };
      }

      // Also check if the booking date is not a past date
      if (DateTimeUtils.isPastDate(startTime)) {
        return { success: false, error: 'Cannot book rooms for past dates. Please select today or a future date.' };
      }

      // Check maximum duration (8 hours)
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      if (durationHours > 8) {
        return { success: false, error: 'Booking duration cannot exceed 8 hours' };
      }

      // Ensure dates are stored in UTC
      const startDateTimeUTC = DateTimeUtils.toUTC(startTime);
      const endDateTimeUTC = DateTimeUtils.toUTC(endTime);

      // Get current user's ID from the users table using email
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('user_id')
        .eq('email', user.email)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user data:', userError);
        setError('Failed to get user information');
        return { success: false, error: 'Failed to get user information' };
      }

      // Check for conflicting bookings
      const { data: conflictingBookings, error: conflictError } = await supabase
        .from('booking')
        .select('booking_id')
        .eq('room_id', bookingData.room_id)
        .neq('status', 'Cancelled')
        .neq('status', 'Rejected')
        .or(`and(start_datetime.lte.${startDateTimeUTC.toISOString()},end_datetime.gt.${startDateTimeUTC.toISOString()}),and(start_datetime.lt.${endDateTimeUTC.toISOString()},end_datetime.gte.${endDateTimeUTC.toISOString()}),and(start_datetime.gte.${startDateTimeUTC.toISOString()},end_datetime.lte.${endDateTimeUTC.toISOString()})`);

      if (conflictError) {
        console.error('Error checking for conflicts:', conflictError);
        return { success: false, error: 'Failed to check availability' };
      }

      if (conflictingBookings && conflictingBookings.length > 0) {
        return { success: false, error: 'Room is not available for the selected time slot' };
      }

      // Create the booking
      const { data, error: bookingError } = await supabase
        .from('booking')
        .insert({
          user_id: userData.user_id,
          room_id: bookingData.room_id,
          title: bookingData.title,
          start_datetime: startDateTimeUTC.toISOString(),
          end_datetime: endDateTimeUTC.toISOString(),
          status: bookingData.status || 'Pending', // Default to Approved for quick bookings
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Error creating booking:', bookingError);
        setError('Failed to create booking');
        return { success: false, error: 'Failed to create booking' };
      }

      return { success: true, booking: data };
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const createQuickBooking = async (roomId: number, title: string = 'Quick Booking'): Promise<{ success: boolean; booking?: Booking; error?: string }> => {
    // Create a booking for the next hour (current time to current time + 1 hour)
    const now = DateTimeUtils.now();
    const endTime = new Date(now.getTime() + 60 * 60 * 1000); // Add 1 hour

    return createBooking({
      room_id: roomId,
      title: title,
      start_datetime: now.toISOString(),
      end_datetime: endTime.toISOString(),
      status: 'Pending' // Quick bookings are auto-approved
    });
  };

  // src/hooks/Booking/useBooking.ts
  // ...
  const getUserBookings = useCallback(async (): Promise<{ success: boolean; bookings?: Booking[]; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update booking statuses based on current time (Pending→Approved, Expired bookings)
      await BookingStatusManager.performStatusCheck();

      // Get current user's ID
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('user_id')
        .eq('email', user.email)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user data:', userError);
        return { success: false, error: 'Failed to get user information' };
      }

      // Fetch user's bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('booking')
        .select('*')
        .eq('user_id', userData.user_id)
        .order('start_datetime', { ascending: false }); // Diubah menjadi descending agar yg baru di atas

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        return { success: false, error: 'Failed to fetch bookings' };
      }

      return { success: true, bookings: bookings || [] };
    } catch (err) {
      console.error('Unexpected error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  const getCurrentBookings = useCallback(async (): Promise<{
    success: boolean;
    bookings?: Booking[];
    error?: string;
  }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update booking statuses based on current time (Pending→Approved, Expired bookings)
      await BookingStatusManager.performStatusCheck();

      // Get current user's ID
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('user_id')
        .eq('email', user.email)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user data:', userError);
        return { success: false, error: 'Failed to get user information' };
      }

      // Fetch user's current/upcoming bookings that are approved or pending
      const { data, error: fetchError } = await supabase
        .from('booking')
        .select('*')
        .eq('user_id', userData.user_id)
        .in('status', ['Approved', 'Pending'])
        .gte('end_datetime', new Date().toISOString()) // Only future or ongoing bookings
        .order('start_datetime', { ascending: true });

      if (fetchError) {
        console.error('Error fetching current bookings:', fetchError);
        return { success: false, error: 'Failed to fetch current bookings' };
      }

      return { success: true, bookings: data as Booking[] };
    } catch (err: any) {
      console.error('Unexpected error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateBooking = async (
    bookingId: number,
    updatedData: { title: string; start_datetime: string; end_datetime: string }
  ): Promise<{ success: boolean; booking?: Booking; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate booking times
      const startTime = new Date(updatedData.start_datetime);
      const endTime = new Date(updatedData.end_datetime);

      // Check if start time is before end time
      if (startTime >= endTime) {
        return { success: false, error: 'Start time must be before end time' };
      }

      // Check if booking is not in the past (using timezone-aware validation)
      if (DateTimeUtils.isPastDateTime(startTime)) {
        return { success: false, error: 'Cannot schedule booking in the past' };
      }

      // Get current user's ID
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('user_id')
        .eq('email', user.email)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user data:', userError);
        return { success: false, error: 'Failed to get user information' };
      }

      // Convert times to UTC
      const startDateTimeUTC = DateTimeUtils.toUTC(startTime);
      const endDateTimeUTC = DateTimeUtils.toUTC(endTime);

      // Update the booking
      const { data, error: updateError } = await supabase
        .from('booking')
        .update({
          title: updatedData.title,
          start_datetime: startDateTimeUTC.toISOString(),
          end_datetime: endDateTimeUTC.toISOString(),
        })
        .eq('booking_id', bookingId)
        .eq('user_id', userData.user_id) // Ensure user can only update their own bookings
        .select()
        .single();

      if (updateError) {
        console.error('Error updating booking:', updateError);
        return { success: false, error: 'Failed to update booking' };
      }

      return { success: true, booking: data };
    } catch (err) {
      console.error('Unexpected error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createBooking,
    createQuickBooking,
    getCurrentBookings,
    getUserBookings,
    updateBooking,
    isLoading,
    error
  };
}
