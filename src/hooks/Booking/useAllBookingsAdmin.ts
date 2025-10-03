import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../utils/supabase';
import { BookingStatusManager } from '../../utils/bookingStatusManager';

// Mendefinisikan tipe data untuk booking dengan tambahan informasi user
export interface AdminBookingView extends Omit<Booking, 'user_id'> {
  user_id: string;
  user_name: string;
  room_name: string;
}

// Impor tipe Booking jika belum ada
export interface Booking {
  booking_id: number;
  user_id: number;
  room_id: number;
  title: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Completed' | 'Expired' | null;
  start_datetime: string;
  end_datetime: string;
  created_at: string;
}


export function useAllBookingsAdmin() {
  const [bookings, setBookings] = useState<AdminBookingView[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Selalu update status booking berdasarkan waktu saat ini
      await BookingStatusManager.performStatusCheck();

      // Mengambil semua data booking dan menggabungkannya dengan data user & ruangan
      const { data, error: fetchError } = await supabase
        .from('booking')
        .select(`
          booking_id,
          user_id,
          room_id,
          title,
          status,
          start_datetime,
          end_datetime,
          created_at,
          user:user_id (name),
          room:room_id (room_name)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Transformasi data untuk menyederhanakan akses di komponen
      const transformedData = data.map((item: any) => ({
        ...item,
        user_name: item.user?.name || 'Unknown User',
        room_name: item.room?.room_name || 'Unknown Room',
      }));

      setBookings(transformedData);

    } catch (err: any) {
      console.error('Error fetching all bookings:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  return {
    bookings,
    isLoading,
    error,
    refetchBookings: fetchAllBookings,
  };
}