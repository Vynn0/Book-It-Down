import { format, parseISO } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const JAKARTA_TIMEZONE = 'Asia/Jakarta'; // UTC+7

export class DateTimeUtils {
  /**
   * Convert local Jakarta time to UTC for database storage
   */
  static toUTC(localDate: Date): Date {
    return fromZonedTime(localDate, JAKARTA_TIMEZONE);
  }

  /**
   * Convert UTC from database to local Jakarta time
   */
  static fromUTC(utcDate: Date | string): Date {
    const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
    return toZonedTime(date, JAKARTA_TIMEZONE);
  }

  /**
   * Format date for display in local timezone
   */
  static formatLocal(date: Date | string, formatString: string = 'dd/MM/yyyy HH:mm'): string {
    const localDate = this.fromUTC(date);
    return format(localDate, formatString);
  }

  /**
   * Get current Jakarta time
   */
  static now(): Date {
    return toZonedTime(new Date(), JAKARTA_TIMEZONE);
  }

  /**
   * Create a date in Jakarta timezone
   */
  static createLocal(year: number, month: number, day: number, hour: number = 0, minute: number = 0): Date {
    const localDate = new Date(year, month - 1, day, hour, minute);
    return this.toUTC(localDate);
  }

  /**
   * Get start of day in Jakarta timezone (00:00:00)
   */
  static getStartOfDay(date: Date): Date {
    const localDate = toZonedTime(date, JAKARTA_TIMEZONE);
    const startOfDay = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 0, 0, 0, 0);
    return fromZonedTime(startOfDay, JAKARTA_TIMEZONE);
  }

  /**
   * Get end of day in Jakarta timezone (23:59:59)
   */
  static getEndOfDay(date: Date): Date {
    const localDate = toZonedTime(date, JAKARTA_TIMEZONE);
    const endOfDay = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 23, 59, 59, 999);
    return fromZonedTime(endOfDay, JAKARTA_TIMEZONE);
  }

  /**
   * Check if two dates are the same day in Jakarta timezone
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    const local1 = toZonedTime(date1, JAKARTA_TIMEZONE);
    const local2 = toZonedTime(date2, JAKARTA_TIMEZONE);
    
    return local1.getFullYear() === local2.getFullYear() &&
           local1.getMonth() === local2.getMonth() &&
           local1.getDate() === local2.getDate();
  }

  /**
   * Add minutes to a date
   */
  static addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60 * 1000);
  }

  /**
   * Get duration between two dates in minutes
   */
  static getDurationMinutes(startDate: Date, endDate: Date): number {
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  }

  /**
   * Format time only (HH:mm)
   */
  static formatTime(date: Date | string): string {
    const localDate = typeof date === 'string' ? this.fromUTC(date) : toZonedTime(date, JAKARTA_TIMEZONE);
    return format(localDate, 'HH:mm');
  }

  /**
   * Format date only (dd/MM/yyyy)
   */
  static formatDate(date: Date | string): string {
    const localDate = typeof date === 'string' ? this.fromUTC(date) : toZonedTime(date, JAKARTA_TIMEZONE);
    return format(localDate, 'dd/MM/yyyy');
  }
}