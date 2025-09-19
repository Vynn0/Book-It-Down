import {
    Box,
    TextField,
    Button,
    CircularProgress
} from '@mui/material'
import { MeetingRoom } from '@mui/icons-material'
import type { RoomForm } from '../../hooks/Rooms/useRoomManagement'

interface RoomFormComponentProps {
    roomForm: RoomForm
    isLoading: boolean
    onInputChange: (field: keyof RoomForm, value: string | number) => void
    onSubmit: (e: React.FormEvent) => void
    submitButtonText?: string
}

function RoomFormComponent({
    roomForm,
    isLoading,
    onInputChange,
    onSubmit,
    submitButtonText = 'Add Room'
}: RoomFormComponentProps) {

    const handleInputChange = (field: keyof RoomForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = field === 'capacity' ? parseInt(e.target.value) || 0 : e.target.value
        onInputChange(field, value)
    }

    return (
        <Box component="form" onSubmit={onSubmit}>
            <TextField
                fullWidth
                label="Room Name"
                value={roomForm.room_name}
                onChange={handleInputChange('room_name')}
                required
                margin="normal"
                placeholder="Enter room name"
                sx={{ mb: 2 }}
            />

            <TextField
                fullWidth
                label="Location"
                value={roomForm.location}
                onChange={handleInputChange('location')}
                required
                margin="normal"
                placeholder="Enter room location"
                sx={{ mb: 2 }}
            />

            <TextField
                fullWidth
                type="number"
                label="Capacity"
                value={roomForm.capacity}
                onChange={handleInputChange('capacity')}
                required
                margin="normal"
                placeholder="Enter room capacity"
                inputProps={{ min: 1, max: 1000 }}
                sx={{ mb: 2 }}
            />

            <TextField
                fullWidth
                label="Description"
                value={roomForm.description}
                onChange={handleInputChange('description')}
                margin="normal"
                placeholder="Enter room description (optional)"
                multiline
                rows={3}
                sx={{ mb: 3 }}
            />

            <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <MeetingRoom />}
                sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                }}
            >
                {isLoading ? 'Adding Room...' : submitButtonText}
            </Button>
        </Box>
    )
}

export default RoomFormComponent