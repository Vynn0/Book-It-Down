import { useState } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './useAuth';

export interface Booking {
  booking_id: number;
  user_id: number;
  room_id: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | null;
  start_datetime: string;
  end_datetime: string;
  created_at: string;
}

export interface CreateBookingData {
  room_id: number;
  start_datetime: string;
  end_datetime: string;
  status?: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
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

      // Create the booking
      const { data, error: bookingError } = await supabase
        .from('booking')
        .insert({
          user_id: userData.user_id,
          room_id: bookingData.room_id,
          start_datetime: bookingData.start_datetime,
          end_datetime: bookingData.end_datetime,
          status: bookingData.status || 'Pending',
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

  const createQuickBooking = async (roomId: number): Promise<{ success: boolean; booking?: Booking; error?: string }> => {
    // Create a booking for the next hour (current time to current time + 1 hour)
    const now = new Date();
    const endTime = new Date(now.getTime() + 60 * 60 * 1000); // Add 1 hour

    return createBooking({
      room_id: roomId,
      start_datetime: now.toISOString(),
      end_datetime: endTime.toISOString(),
      status: 'Pending'
    });
  };

  return {
    createBooking,
    createQuickBooking,
    isLoading,
    error
  };
}
