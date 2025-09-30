import { BookingStatusManager } from '../utils/bookingStatusManager';
import { DateTimeUtils } from '../utils/dateUtils';

/**
 * Test script to demonstrate automatic booking status updates
 * This would normally be run in a development environment or as part of tests
 */
export async function testBookingStatusSystem() {
  console.log('=== Testing Booking Status System ===');
  
  try {
    // Get current time for reference
    const currentTime = DateTimeUtils.now();
    console.log('Current time:', currentTime.toISOString());
    
    // Perform a comprehensive status check
    console.log('\n1. Running comprehensive status check...');
    const result = await BookingStatusManager.performStatusCheck();
    
    if (result.success && result.summary) {
      console.log('✅ Status check completed successfully');
      console.log(`   - Pending to Approved updates: ${result.summary.pendingToApprovedUpdates}`);
      console.log(`   - Expired bookings updated: ${result.summary.expiredUpdates}`);
      console.log(`   - Total bookings checked: ${result.summary.totalChecked}`);
    } else {
      console.log('❌ Status check failed:', result.error);
    }
    
    // Check for bookings about to expire
    console.log('\n2. Checking for bookings about to expire...');
    const expiringSoon = await BookingStatusManager.getBookingsAboutToExpire();
    
    if (expiringSoon.success) {
      console.log(`✅ Found ${expiringSoon.bookings?.length || 0} bookings expiring in the next 15 minutes`);
      expiringSoon.bookings?.forEach(booking => {
        const endTime = DateTimeUtils.fromUTC(booking.end_datetime);
        console.log(`   - Booking ${booking.booking_id} ends at ${DateTimeUtils.formatLocal(endTime)}`);
      });
    } else {
      console.log('❌ Failed to check expiring bookings:', expiringSoon.error);
    }
    
    console.log('\n=== Test completed ===');
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Usage examples:
// testBookingStatusSystem();