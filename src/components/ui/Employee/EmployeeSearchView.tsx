import { Box, Typography, Card, CardContent } from '@mui/material';

interface EmployeeSearchViewProps {
  onBack: () => void;
}

export function EmployeeSearchView({}: EmployeeSearchViewProps) {
  return (
    <Box>
      <Card sx={{ mb: 3, bgcolor: '#e3f2fd' }}>
        <CardContent>
          <Typography variant="h5" color="primary" gutterBottom>
            👤 Employee Search View
          </Typography>
          <Typography variant="body1">
            You can search and book available meeting rooms.
          </Typography>
        </CardContent>
      </Card>
      
      {/* <Typography variant="h6" gutterBottom>
        Employee Features:
      </Typography> */}
      <Box component="ul" sx={{ pl: 2 }}>
        {/* <Typography component="li">Search available rooms</Typography>
        <Typography component="li">Book rooms for meetings</Typography>
        <Typography component="li">View your bookings</Typography>
        <Typography component="li">Cancel your own bookings</Typography> */}
      </Box>
    </Box>
  );
}
