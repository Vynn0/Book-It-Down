import { useState } from 'react';
import { supabase } from '../../utils/supabase';
import { DateTimeUtils } from '../../utils/dateUtils';

export interface AvailableRoom {
    room_id: number;
    room_name: string;
    location: string;
    capacity: number;
    description: string;
    created_at: string;
}

export interface SearchQuery {
    tanggal: Date | null;
    jamMulai: Date | null;
    jamSelesai: Date | null;
    kapasitas: number;
}

export function useRoomAvailabilitySearch() {
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchAvailableRooms = async (query: SearchQuery): Promise<AvailableRoom[]> => {
        const { tanggal, jamMulai, jamSelesai, kapasitas } = query;

        // Validate input
        if (!tanggal || !jamMulai || !jamSelesai) {
            throw new Error('Please provide date, start time, and end time');
        }

        if (jamSelesai <= jamMulai) {
            throw new Error('End time must be after start time');
        }

        if (!kapasitas || kapasitas < 1) {
            throw new Error('Please provide a valid capacity (minimum 1)');
        }

        setIsSearching(true);
        setError(null);

        try {
            // Combine date with times to create full datetime objects
            const searchStartTime = new Date(tanggal);
            searchStartTime.setHours(jamMulai.getHours(), jamMulai.getMinutes(), 0, 0);

            const searchEndTime = new Date(tanggal);
            searchEndTime.setHours(jamSelesai.getHours(), jamSelesai.getMinutes(), 0, 0);

            // Convert to UTC for database queries
            const startTimeUTC = DateTimeUtils.toUTC(searchStartTime);
            const endTimeUTC = DateTimeUtils.toUTC(searchEndTime);

            console.log('Searching for available rooms:');
            console.log('Date:', DateTimeUtils.formatDate(tanggal));
            console.log('Time range:', DateTimeUtils.formatTime(searchStartTime), '-', DateTimeUtils.formatTime(searchEndTime));
            console.log('Min capacity:', kapasitas);

            // Step 1: Get all rooms that meet capacity requirement
            const { data: allRooms, error: roomsError } = await supabase
                .from('room')
                .select('*')
                .gte('capacity', kapasitas)
                .order('capacity', { ascending: true });

            if (roomsError) {
                console.error('Error fetching rooms:', roomsError);
                console.error('Query details:', {
                    table: 'room',
                    filter: `capacity >= ${kapasitas}`,
                    error: roomsError
                });
                throw new Error(`Failed to fetch rooms: ${roomsError.message || JSON.stringify(roomsError)}`);
            }

            if (!allRooms || allRooms.length === 0) {
                console.log('No rooms found with required capacity');
                return [];
            }

            console.log(`Found ${allRooms.length} rooms with capacity >= ${kapasitas}`);

            // Step 2: Check each room for availability during the requested time
            const availableRooms: AvailableRoom[] = [];

            for (const room of allRooms) {
                const isAvailable = await checkRoomAvailability(
                    room.room_id,
                    startTimeUTC,
                    endTimeUTC
                );

                if (isAvailable) {
                    availableRooms.push({
                        room_id: room.room_id,
                        room_name: room.room_name,
                        location: room.location,
                        capacity: room.capacity,
                        description: room.description,
                        created_at: room.created_at
                    });
                }
            }

            console.log(`Found ${availableRooms.length} available rooms`);
            return availableRooms;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
            setError(errorMessage);
            console.error('Error searching for available rooms:', err);
            throw err;
        } finally {
            setIsSearching(false);
        }
    };

    const checkRoomAvailability = async (
        roomId: number,
        startTime: Date,
        endTime: Date
    ): Promise<boolean> => {
        try {
            // Get all active bookings for this room
            const { data: bookings, error } = await supabase
                .from('booking')
                .select('booking_id, start_datetime, end_datetime, status')
                .eq('room_id', roomId)
                .in('status', ['Pending', 'Approved']); // Only consider active bookings

            if (error) {
                console.error(`Error checking availability for room ${roomId}:`, error);
                return false; // Assume unavailable on error
            }

            // Check for time conflicts
            const hasConflict = (bookings || []).some(booking => {
                const bookingStart = new Date(booking.start_datetime);
                const bookingEnd = new Date(booking.end_datetime);

                // Check if requested time overlaps with existing booking
                const overlaps = (
                    (startTime < bookingEnd && endTime > bookingStart) ||
                    (startTime >= bookingStart && startTime < bookingEnd) ||
                    (endTime > bookingStart && endTime <= bookingEnd) ||
                    (startTime <= bookingStart && endTime >= bookingEnd)
                );

                if (overlaps) {
                    console.log(`Room ${roomId} conflict found:`, {
                        requestedTime: `${startTime.toISOString()} - ${endTime.toISOString()}`,
                        existingBooking: `${booking.start_datetime} - ${booking.end_datetime}`,
                        status: booking.status
                    });
                }

                return overlaps;
            });

            return !hasConflict; // Available if no conflicts
        } catch (err) {
            console.error(`Error checking room ${roomId} availability:`, err);
            return false; // Assume unavailable on error
        }
    };

    return {
        searchAvailableRooms,
        isSearching,
        error
    };
}