import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { MeetingRoom } from '@mui/icons-material';

interface RoomManagerSearchViewProps {
  goToRoomManagement: () => void;
}

export function RoomManagerSearchView({ goToRoomManagement }: RoomManagerSearchViewProps) {
  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3, bgcolor: '#e8f5e8' }}>
        <CardContent>
          <Typography variant="h5" color="primary" gutterBottom>
            🏢 Room Manager Search View
          </Typography>
          <Typography variant="body1">
            You can manage room bookings and view room availability.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={<MeetingRoom />}
            onClick={goToRoomManagement}
            sx={{ mt: 2 }}
          >
            Go to Room Management
          </Button>
        </CardContent>
      </Card>

      {/* <Typography variant="h6" gutterBottom>
        Room Manager Features:
      </Typography> */}
      <Box component="ul" sx={{ pl: 2 }}>
        {/* <Typography component="li">View and book all available rooms</Typography>
        <Typography component="li">Manage existing bookings</Typography>
        <Typography component="li">Room availability reports</Typography>
        <Typography component="li">Basic room maintenance requests</Typography> */}
      </Box>
    </Box>
  );
}
