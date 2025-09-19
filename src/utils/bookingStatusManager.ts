import { supabase } from './supabase';
import { DateTimeUtils } from './dateUtils';

export interface BookingStatusUpdate {
  booking_id: number;
  old_status: string;
  new_status: string;
  end_datetime: string;
}

export class BookingStatusManager {
  /**
   * Check and update expired bookings
   * Bookings that have passed their end time should be marked as 'Completed' or 'Expired'
   */
  static async updateExpiredBookings(): Promise<{
    success: boolean;
    updatedBookings?: BookingStatusUpdate[];
    error?: string;
  }> {
    try {
      const currentTime = DateTimeUtils.now();
      console.log('Checking for expired bookings at:', currentTime.toISOString());

      // Fetch all active bookings that have passed their end time
      const { data: expiredBookings, error: fetchError } = await supabase
        .from('booking')
        .select('booking_id, status, end_datetime, start_datetime')
        .in('status', ['Pending', 'Approved'])
        .lt('end_datetime', currentTime.toISOString());

      if (fetchError) {
        console.error('Error fetching expired bookings:', fetchError);
        return { success: false, error: 'Failed to fetch expired bookings' };
      }

      if (!expiredBookings || expiredBookings.length === 0) {
        console.log('No expired bookings found');
        return { success: true, updatedBookings: [] };
      }

      console.log(`Found ${expiredBookings.length} expired bookings to update`);

      const updatedBookings: BookingStatusUpdate[] = [];

      // Update each expired booking
      for (const booking of expiredBookings) {
        const newStatus = this.determineExpiredStatus(booking.status);
        
        const { error: updateError } = await supabase
          .from('booking')
          .update({ 
            status: newStatus,
            // updated_at: new Date().toISOString()
          })
          .eq('booking_id', booking.booking_id);

        if (updateError) {
          console.error(`Error updating booking ${booking.booking_id}:`, updateError);
        } else {
          updatedBookings.push({
            booking_id: booking.booking_id,
            old_status: booking.status,
            new_status: newStatus,
            end_datetime: booking.end_datetime
          });
        }
      }

      console.log(`Successfully updated ${updatedBookings.length} expired bookings`);
      return { success: true, updatedBookings };

    } catch (error) {
      console.error('Unexpected error updating expired bookings:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Determine the new status for an expired booking
   */
  private static determineExpiredStatus(currentStatus: string): string {
    switch (currentStatus) {
      case 'Approved':
        return 'Completed'; // Approved bookings that have ended are marked as completed
      case 'Pending':
        return 'Expired'; // Pending bookings that have ended are marked as expired
      default:
        return currentStatus; // Keep other statuses as is
    }
  }

  /**
   * Check and update bookings that have started (for future use)
   * This can be used to mark bookings as 'In Progress' when they start
   */
  static async updateStartedBookings(): Promise<{
    success: boolean;
    updatedBookings?: BookingStatusUpdate[];
    error?: string;
  }> {
    try {
      const currentTime = DateTimeUtils.now();
      
      // Fetch approved bookings that have started but not ended
      const { data: startedBookings, error: fetchError } = await supabase
        .from('booking')
        .select('booking_id, status, start_datetime, end_datetime')
        .eq('status', 'Approved')
        .lt('start_datetime', currentTime.toISOString())
        .gt('end_datetime', currentTime.toISOString());

      if (fetchError) {
        console.error('Error fetching started bookings:', fetchError);
        return { success: false, error: 'Failed to fetch started bookings' };
      }

      if (!startedBookings || startedBookings.length === 0) {
        return { success: true, updatedBookings: [] };
      }

      // For now, we don't change the status of started bookings
      // This is a placeholder for future functionality
      return { success: true, updatedBookings: [] };

    } catch (error) {
      console.error('Unexpected error updating started bookings:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Get bookings that are about to expire (within next 15 minutes)
   * Useful for notifications
   */
  static async getBookingsAboutToExpire(): Promise<{
    success: boolean;
    bookings?: any[];
    error?: string;
  }> {
    try {
      const currentTime = DateTimeUtils.now();
      const fifteenMinutesLater = DateTimeUtils.addMinutes(currentTime, 15);

      const { data: bookings, error: fetchError } = await supabase
        .from('booking')
        .select(`
          booking_id,
          start_datetime,
          end_datetime,
          status,
          user:user_id (
            name,
            email
          ),
          room:room_id (
            room_name,
            location
          )
        `)
        .in('status', ['Approved'])
        .gte('end_datetime', currentTime.toISOString())
        .lte('end_datetime', fifteenMinutesLater.toISOString());

      if (fetchError) {
        console.error('Error fetching bookings about to expire:', fetchError);
        return { success: false, error: 'Failed to fetch bookings' };
      }

      return { success: true, bookings: bookings || [] };

    } catch (error) {
      console.error('Unexpected error fetching bookings about to expire:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Comprehensive status check - updates all time-based statuses
   */
  static async performStatusCheck(): Promise<{
    success: boolean;
    summary?: {
      expiredUpdates: number;
      startedUpdates: number;
      totalChecked: number;
    };
    error?: string;
  }> {
    try {
      console.log('Starting comprehensive booking status check...');

      // Update expired bookings
      const expiredResult = await this.updateExpiredBookings();
      if (!expiredResult.success) {
        return { success: false, error: expiredResult.error };
      }

      // Update started bookings (placeholder for now)
      const startedResult = await this.updateStartedBookings();
      if (!startedResult.success) {
        return { success: false, error: startedResult.error };
      }

      const summary = {
        expiredUpdates: expiredResult.updatedBookings?.length || 0,
        startedUpdates: startedResult.updatedBookings?.length || 0,
        totalChecked: (expiredResult.updatedBookings?.length || 0) + (startedResult.updatedBookings?.length || 0)
      };

      console.log('Status check summary:', summary);

      return { success: true, summary };

    } catch (error) {
      console.error('Error performing comprehensive status check:', error);
      return { success: false, error: 'Failed to perform status check' };
    }
  }
}