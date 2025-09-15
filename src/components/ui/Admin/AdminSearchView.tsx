import { Box, Typography, Card, CardContent } from '@mui/material';


export function AdminSearchView() {
  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3, bgcolor: '#fff3e0' }}>
        <CardContent>
          <Typography variant="h5" color="primary" gutterBottom>
            🔑 Admin Search View
          </Typography>
          <Typography variant="body1">
            You have full admin access to all rooms and features.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}