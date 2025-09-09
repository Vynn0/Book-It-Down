import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    CssBaseline,
    Button,
    Paper,
    Divider
} from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { appTheme } from '../services'
import { ArrowBack } from '@mui/icons-material'
import { Navbar } from '../components/ui'

interface RoomManagementProps {
    onBack: () => void
}

function RoomManagement({ onBack }: RoomManagementProps) {
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
                            sx={{ mt: 2 }}
                        >
                            Manage Rooms
                        </Button>
                    </Paper>
                </Container>
            </Box>
        </ThemeProvider>
    )
}

export default RoomManagement
