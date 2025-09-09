import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    CssBaseline,
    Button,
    Paper,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Fab
} from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { appTheme } from '../services'
import { ArrowBack, Add } from '@mui/icons-material'
import { Navbar, NotificationComponent, RoomFormComponent } from '../components/ui'
import { useRoomManagement, useNotification } from '../hooks'
import { useState } from 'react'

interface RoomManagementProps {
    onBack: () => void
}

function RoomManagement({ onBack }: RoomManagementProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const {
        roomForm,
        isLoading,
        updateRoomForm,
        resetForm,
        addRoom,
        validateForm
    } = useRoomManagement()

    const {
        notification,
        showNotification,
        hideNotification
    } = useNotification()

    const handleAddRoom = async (e: React.FormEvent) => {
        e.preventDefault()

        const validationError = validateForm(roomForm)
        if (validationError) {
            showNotification(validationError, 'error')
            return
        }

        const result = await addRoom(roomForm)

        if (result.success) {
            showNotification(result.message, 'success')
            resetForm()
            setIsModalOpen(false)
        } else {
            showNotification(result.message, 'error')
        }
    }

    const handleOpenModal = () => {
        resetForm()
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        resetForm()
    }
    return (
        <ThemeProvider theme={appTheme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar title="Room Management" onBack={onBack} />

                <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={onBack}
                        variant="outlined"
                        sx={{ mb: 3 }}
                    >
                        Back to Search
                    </Button>

                    <Paper sx={{ p: 3, mb: 4 }}>
                        <Typography variant="h4" gutterBottom>
                            Room Management Dashboard
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <Typography variant="body1" paragraph>
                            This is a simple Room Management dashboard where room managers can:
                        </Typography>

                        <Box component="ul" sx={{ pl: 4, mb: 3 }}>
                            <Typography component="li" variant="body1">View all available rooms</Typography>
                            <Typography component="li" variant="body1">Manage room bookings</Typography>
                            <Typography component="li" variant="body1">Update room availability</Typography>
                            <Typography component="li" variant="body1">Generate reports</Typography>
                        </Box>

                        <Card sx={{ bgcolor: '#f5f5f5', mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" color="primary" gutterBottom>
                                    Quick Stats
                                </Typography>
                                <Typography variant="body2">
                                    Total Rooms: 42
                                </Typography>
                                <Typography variant="body2">
                                    Available Rooms: 28
                                </Typography>
                                <Typography variant="body2">
                                    Booked Rooms: 14
                                </Typography>
                            </CardContent>
                        </Card>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpenModal}
                            sx={{ mt: 2 }}
                        >
                            Add New Room
                        </Button>
                    </Paper>
                </Container>

                {/* Add Room Modal */}
                <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                    <DialogTitle>Add New Room</DialogTitle>
                    <DialogContent>
                        <RoomFormComponent
                            roomForm={roomForm}
                            isLoading={isLoading}
                            onInputChange={updateRoomForm}
                            onSubmit={handleAddRoom}
                            submitButtonText="Add Room"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseModal} disabled={isLoading}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Floating Action Button for Quick Add */}
                <Fab
                    color="primary"
                    aria-label="add room"
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                    }}
                    onClick={handleOpenModal}
                >
                    <Add />
                </Fab>

                <NotificationComponent
                    notification={notification}
                    onClose={hideNotification}
                />
            </Box>
        </ThemeProvider>
    )
}

export default RoomManagement
