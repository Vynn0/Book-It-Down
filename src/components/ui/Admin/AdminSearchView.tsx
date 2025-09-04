import { Box, Typography, Card, CardContent, Button } from '@mui/material';

interface AdminSearchViewProps {
  goToAdminDashboard: () => void;
}

export function AdminSearchView({ goToAdminDashboard }: AdminSearchViewProps) {
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

        {/* Admin Dashboard Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center'}}>
          <Button
            variant="outlined"
            size="large"
            onClick={goToAdminDashboard}
            sx={{
              py: 1.5,
              borderRadius: 2,
              display: 'flex',
              justifyContent: 'center',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              borderColor: 'secondary.main',
              color: 'secondary.main',
              '&:hover': {
                backgroundColor: 'secondary.main',
                color: 'white'
              }
            }}
          >
            🔧 Developer: Admin Dashboard
          </Button>
        </Box>
      </Card>
      
      <Typography variant="h6" gutterBottom>
        Admin Features:
      </Typography>
      <Box component="ul" sx={{ pl: 2 }}>
        <Typography component="li">View all rooms (including restricted ones)</Typography>
        <Typography component="li">Manage room bookings</Typography>
        <Typography component="li">Access to user management</Typography>
        <Typography component="li">System configuration</Typography>
      </Box>
    </Box>
  );
}