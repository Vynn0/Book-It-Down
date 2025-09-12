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
    Fab,
    CircularProgress
} from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { appTheme } from '../services'
import { Add, Refresh } from '@mui/icons-material'
import { Navbar, NotificationComponent, RoomFormComponent, RoomCard, Sidebar } from '../components/ui' // Perubahan: Impor Sidebar
import { useRoomManagement, useNotification } from '../hooks' // Perubahan: Impor useAuth
import { useState } from 'react'

// Perubahan: Tambahkan prop navigasi
interface RoomManagementProps {
    onBack: () => void
    onProfileClick: () => void
    onNavigateToSearch: () => void
}

function RoomManagement({ onBack, onProfileClick, onNavigateToSearch }: RoomManagementProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    // Perubahan: Tambahkan state untuk sidebar dan dapatkan info user
    const [activeView, setActiveView] = useState('roomManagement');
    const {
        rooms,
        roomForm,
        isLoading,
        isLoadingRooms,
        updateRoomForm,
        resetForm,
        addRoom,
        validateForm,
        refreshRooms
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

    // Perubahan: Handler untuk klik menu sidebar
    const handleMenuClick = (view: string) => {
        if (view === 'addBooking') { // Asumsi Room Manager juga bisa menambah booking
            onNavigateToSearch();
        } else {
            setActiveView(view);
        }
    };

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
            {/* Perubahan: Ganti layout menjadi flexbox */}
            <Box sx={{ display: 'flex' }}>
                <Sidebar activeView={activeView} onMenuClick={handleMenuClick} />
                <Box component="main" sx={{ flexGrow: 1 }}>
                    <Navbar title="Room Management" onBack={onBack} onProfileClick={onProfileClick} />

                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
                        <Paper sx={{ p: 3, mb: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h4" gutterBottom>
                                    Room Management Dashboard
                                </Typography>
                                <Button
                                    startIcon={<Refresh />}
                                    onClick={refreshRooms}
                                    variant="outlined"
                                    disabled={isLoadingRooms}
                                >
                                    Refresh
                                </Button>
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="body1">
                                    Manage and view all available rooms in the system
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Add />}
                                    onClick={handleOpenModal}
                                >
                                    Add New Room
                                </Button>
                            </Box>

                            <Card sx={{ bgcolor: '#f5f5f5', mb: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" color="primary" gutterBottom>
                                        Quick Stats
                                    </Typography>
                                    <Typography variant="body2">
                                        Total Rooms: {rooms.length}
                                    </Typography>
                                    <Typography variant="body2">
                                        Available Rooms: {rooms.length}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Paper>

                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h5" gutterBottom>
                                All Rooms
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            
                            {isLoadingRooms ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : rooms.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No rooms found. Add a new room to get started.
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ 
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: 'repeat(2, 1fr)',
                                        md: 'repeat(3, 1fr)'
                                    },
                                    gap: 3
                                }}>
                                    {rooms.map((room) => (
                                        <RoomCard key={room.room_id} room={room} />
                                    ))}
                                </Box>
                            )}
                        </Paper>
                    </Container>

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
            </Box>
        </ThemeProvider>
    )
}

export default RoomManagement