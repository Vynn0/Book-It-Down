import { useEffect, useCallback } from 'react';
import { BookingStatusManager } from '../utils/bookingStatusManager';

export function useBookingStatusChecker(intervalMinutes: number = 5) {
  const performStatusCheck = useCallback(async () => {
    try {
      const result = await BookingStatusManager.performStatusCheck();
      if (result.success && result.summary) {
        console.log('Automatic status check completed:', result.summary);
        
        // You can add notification logic here if needed
        if (result.summary.totalChecked > 0) {
          console.log(`Updated ${result.summary.totalChecked} booking statuses`);
        }
      }
    } catch (error) {
      console.error('Error performing automatic status check:', error);
    }
  }, []);

  useEffect(() => {
    // Perform initial check
    performStatusCheck();

    // Set up periodic checks
    const interval = setInterval(() => {
      performStatusCheck();
    }, intervalMinutes * 60 * 1000); // Convert minutes to milliseconds

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
    };
  }, [performStatusCheck, intervalMinutes]);

  return {
    performManualCheck: performStatusCheck
  };
}

export default useBookingStatusChecker;