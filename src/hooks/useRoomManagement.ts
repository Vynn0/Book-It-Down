import { useState } from 'react'
import { supabase } from '../utils/supabase'

export interface RoomForm {
    room_name: string
    location: string
    capacity: number
    description: string
}

export interface UseRoomManagementReturn {
    roomForm: RoomForm
    isLoading: boolean
    updateRoomForm: (field: keyof RoomForm, value: string | number) => void
    resetForm: () => void
    addRoom: (roomData: RoomForm) => Promise<{ success: boolean; message: string }>
    validateForm: (roomData: RoomForm) => string | null
}

export const useRoomManagement = (): UseRoomManagementReturn => {
    const [roomForm, setRoomForm] = useState<RoomForm>({
        room_name: '',
        location: '',
        capacity: 1,
        description: ''
    })
    const [isLoading, setIsLoading] = useState(false)

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

    return {
        roomForm,
        isLoading,
        updateRoomForm,
        resetForm,
        addRoom,
        validateForm
    }
}