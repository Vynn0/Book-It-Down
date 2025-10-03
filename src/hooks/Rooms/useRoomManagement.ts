import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'

export interface Room {
    room_id: number
    room_name: string
    location: string
    capacity: number
    description: string
    created_at: string
    features?: string[] // Optional features array for future use
}

export interface RoomForm {
    room_name: string
    location: string
    capacity: number
    description: string
}

export interface UseRoomManagementReturn {
    rooms: Room[]
    roomForm: RoomForm
    isLoading: boolean
    isLoadingRooms: boolean
    updateRoomForm: (field: keyof RoomForm, value: string | number) => void
    resetForm: () => void
    addRoom: (roomData: RoomForm) => Promise<{ success: boolean; message: string }>
    updateRoom: (roomId: number, roomData: RoomForm) => Promise<{ success: boolean; message: string }>
    deleteRoom: (roomId: number) => Promise<{ success: boolean; message: string }>
    validateForm: (roomData: RoomForm) => string | null
    fetchRooms: () => Promise<void>
    refreshRooms: () => Promise<void>
}

export const useRoomManagement = (): UseRoomManagementReturn => {
    const [rooms, setRooms] = useState<Room[]>([])
    const [roomForm, setRoomForm] = useState<RoomForm>({
        room_name: '',
        location: '',
        capacity: 1,
        description: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingRooms, setIsLoadingRooms] = useState(true)

    // Fetch rooms from database
    const fetchRooms = async (): Promise<void> => {
        setIsLoadingRooms(true)
        try {
            const { data, error } = await supabase
                .from('room')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                throw error
            }

            setRooms(data || [])
        } catch (error) {
            console.error('Error fetching rooms:', error)
            setRooms([])
        } finally {
            setIsLoadingRooms(false)
        }
    }

    // Refresh rooms data
    const refreshRooms = async (): Promise<void> => {
        await fetchRooms()
    }

    // Load rooms on component mount
    useEffect(() => {
        fetchRooms()
    }, [])

    const updateRoomForm = (field: keyof RoomForm, value: string | number) => {
        setRoomForm(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const resetForm = () => {
        setRoomForm({
            room_name: '',
            location: '',
            capacity: 1,
            description: ''
        })
    }

    const validateForm = (roomData: RoomForm): string | null => {
        if (!roomData.room_name.trim()) return 'Room name is required'
        if (!roomData.location.trim()) return 'Location is required'
        if (roomData.capacity < 1) return 'Capacity must be at least 1'
        if (roomData.capacity > 1000) return 'Capacity cannot exceed 1000'

        return null
    }

    const addRoom = async (roomData: RoomForm): Promise<{ success: boolean; message: string }> => {
        setIsLoading(true)

        try {
            // Insert room into Supabase
            const { error } = await supabase
                .from('room')
                .insert([
                    {
                        room_name: roomData.room_name.trim(),
                        location: roomData.location.trim(),
                        capacity: roomData.capacity,
                        description: roomData.description.trim(),
                        created_at: new Date().toISOString()
                    }
                ])
                .select()

            if (error) {
                throw error
            }

            // Refresh rooms list after successful addition
            await fetchRooms()

            return {
                success: true,
                message: `Room "${roomData.room_name}" added successfully!`
            }

        } catch (error: any) {
            console.error('Error adding room:', error)
            return {
                success: false,
                message: error.message || 'Failed to add room. Please try again.'
            }
        } finally {
            setIsLoading(false)
        }
    }

    const updateRoom = async (roomId: number, roomData: RoomForm): Promise<{ success: boolean; message: string }> => {
        setIsLoading(true)

        try {
            // Update room in Supabase
            const { error } = await supabase
                .from('room')
                .update({
                    room_name: roomData.room_name.trim(),
                    location: roomData.location.trim(),
                    capacity: roomData.capacity,
                    description: roomData.description.trim(),
                })
                .eq('room_id', roomId)

            if (error) {
                throw error
            }

            // Refresh rooms list after successful update
            await fetchRooms()

            return {
                success: true,
                message: `Room "${roomData.room_name}" updated successfully!`
            }

        } catch (error: any) {
            console.error('Error updating room:', error)
            return {
                success: false,
                message: error.message || 'Failed to update room. Please try again.'
            }
        } finally {
            setIsLoading(false)
        }
    }
    
    const deleteRoom = async (roomId: number): Promise<{ success: boolean; message: string }> => {
        setIsLoading(true);

        try {
            // Step 1: Check if the room has any associated bookings
            const { count, error: bookingCheckError } = await supabase
                .from('booking')
                .select('booking_id', { count: 'exact', head: true })
                .eq('room_id', roomId);

            if (bookingCheckError) {
                throw new Error(`Failed to check bookings: ${bookingCheckError.message}`);
            }

            if (count !== null && count > 0) {
                return {
                    success: false,
                    message: 'Cannot delete room. It has existing bookings associated with it.'
                };
            }

            // Step 2: Fetch all images to delete from storage
            const { data: images, error: imageFetchError } = await supabase
                .from('room_images')
                .select('image_name')
                .eq('room_id', roomId);

            if (imageFetchError) {
                console.warn(`Could not fetch images for room ${roomId}, storage cleanup might be incomplete: ${imageFetchError.message}`);
            }

            // Step 3: Delete images from Supabase Storage
            if (images && images.length > 0) {
                const filePaths = images.map(image => `${roomId}/${image.image_name}`);
                const { error: storageError } = await supabase.storage
                    .from('room-images')
                    .remove(filePaths);

                if (storageError) {
                    console.warn(`Failed to delete images from storage, but proceeding with database deletion: ${storageError.message}`);
                }
            }

            // Step 4: Delete the room record (assuming ON DELETE CASCADE is set for room_images)
            const { error: deleteRoomError } = await supabase
                .from('room')
                .delete()
                .eq('room_id', roomId);

            if (deleteRoomError) {
                throw deleteRoomError;
            }

            // Step 5: Refresh the room list in the UI
            await fetchRooms();

            return {
                success: true,
                message: 'Room has been deleted successfully.'
            };

        } catch (error: any) {
            console.error('Error deleting room:', error);
            return {
                success: false,
                message: error.message || 'Failed to delete room. Please try again.'
            };
        } finally {
            setIsLoading(false);
        }
    };


    return {
        rooms,
        roomForm,
        isLoading,
        isLoadingRooms,
        updateRoomForm,
        resetForm,
        addRoom,
        updateRoom,
        deleteRoom,
        validateForm,
        fetchRooms,
        refreshRooms
    }
}