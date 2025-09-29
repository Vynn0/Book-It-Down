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
   * Update Pending bookings to Approved when their start time has arrived
   * Pending bookings that have started should be marked as 'Approved' (Ongoing)
   */
  static async updatePendingToApproved(): Promise<{
    success: boolean;
    updatedBookings?: BookingStatusUpdate[];
    error?: string;
  }> {
    try {
      const currentTime = DateTimeUtils.now();
      console.log('Checking for pending bookings to approve at:', currentTime.toISOString());

      // Fetch pending bookings that have started but not ended
      const { data: pendingBookings, error: fetchError } = await supabase
        .from('booking')
        .select('booking_id, status, start_datetime, end_datetime')
        .eq('status', 'Pending')
        .lte('start_datetime', currentTime.toISOString())
        .gt('end_datetime', currentTime.toISOString());

      if (fetchError) {
        console.error('Error fetching pending bookings to approve:', fetchError);
        return { success: false, error: 'Failed to fetch pending bookings' };
      }

      if (!pendingBookings || pendingBookings.length === 0) {
        console.log('No pending bookings to approve found');
        return { success: true, updatedBookings: [] };
      }

      console.log(`Found ${pendingBookings.length} pending bookings to approve`);

      const updatedBookings: BookingStatusUpdate[] = [];

      // Update each pending booking to approved
      for (const booking of pendingBookings) {
        const { error: updateError } = await supabase
          .from('booking')
          .update({
            status: 'Approved'
          })
          .eq('booking_id', booking.booking_id);

        if (updateError) {
          console.error(`Error updating booking ${booking.booking_id} to approved:`, updateError);
        } else {
          updatedBookings.push({
            booking_id: booking.booking_id,
            old_status: 'Pending',
            new_status: 'Approved',
            end_datetime: booking.end_datetime
          });
        }
      }

      console.log(`Successfully updated ${updatedBookings.length} pending bookings to approved`);
      return { success: true, updatedBookings };

    } catch (error) {
      console.error('Unexpected error updating pending bookings to approved:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Check and update expired bookings
   * Bookings that have passed their end time should be marked as 'Expired'
   * This includes both Approved bookings and Cancelled bookings
   */
  static async updateExpiredBookings(): Promise<{
    success: boolean;
    updatedBookings?: BookingStatusUpdate[];
    error?: string;
  }> {
    try {
      const currentTime = DateTimeUtils.now();
      console.log('Checking for expired bookings at:', currentTime.toISOString());

      // Fetch all active bookings (Approved, Pending, Cancelled) that have passed their end time
      const { data: expiredBookings, error: fetchError } = await supabase
        .from('booking')
        .select('booking_id, status, end_datetime, start_datetime')
        .in('status', ['Pending', 'Approved', 'Cancelled'])
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
        const newStatus = this.determineExpiredStatus();

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
   * All bookings that have passed their end time become 'Expired'
   */
  private static determineExpiredStatus(): string {
    // All expired bookings become 'Expired' regardless of their previous status
    return 'Expired';
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
   * Comprehensive status check - updates all time-based statuses in correct order
   * 1. First convert Pending bookings that have started to Approved
   * 2. Then convert bookings that have ended to Expired
   */
  static async performStatusCheck(): Promise<{
    success: boolean;
    summary?: {
      pendingToApprovedUpdates: number;
      expiredUpdates: number;
      totalChecked: number;
    };
    error?: string;
  }> {
    try {
      console.log('Starting comprehensive booking status check...');

      // Step 1: Update pending bookings that have started to approved
      const pendingResult = await this.updatePendingToApproved();
      if (!pendingResult.success) {
        return { success: false, error: pendingResult.error };
      }

      // Step 2: Update expired bookings (both approved and cancelled)
      const expiredResult = await this.updateExpiredBookings();
      if (!expiredResult.success) {
        return { success: false, error: expiredResult.error };
      }

      const summary = {
        pendingToApprovedUpdates: pendingResult.updatedBookings?.length || 0,
        expiredUpdates: expiredResult.updatedBookings?.length || 0,
        totalChecked: (pendingResult.updatedBookings?.length || 0) + (expiredResult.updatedBookings?.length || 0)
      };

      console.log('Status check summary:', summary);

      return { success: true, summary };

    } catch (error) {
      console.error('Error performing comprehensive status check:', error);
      return { success: false, error: 'Failed to perform status check' };
    }
  }
}