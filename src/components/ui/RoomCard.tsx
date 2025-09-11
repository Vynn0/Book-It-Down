import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';

interface Room {
  room_id: number;
  room_name: string;
  location: string;
  capacity: number;
  description: string;
  created_at: string;
  features?: string[]; // Add features for future use
}

interface RoomCardProps {
  room: Room;
  onBookClick?: () => void;
  onCardClick?: () => void;
  imageSrc?: string; // Optional custom image
  buttonText?: string; // Customizable button text
}

export function RoomCard({ 
  room, 
  onBookClick, 
  onCardClick,
  imageSrc,
  buttonText = "View Details"
}: RoomCardProps) {
  // Use custom image or placeholder
  const displayImage = imageSrc || "https://via.placeholder.com/345x180/3C355F/FFFFFF?text=Room+Image";

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick();
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when button is clicked
    if (onBookClick) {
      onBookClick();
    }
  };

  return (
    <Card sx={{ 
      maxWidth: 345, 
      borderRadius: '16px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      cursor: onCardClick ? 'pointer' : 'default',
    }}
    onClick={handleCardClick}
    >
      <Box sx={{
        height: 180,
        overflow: 'hidden',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
      }}>
        <img
          src={displayImage}
          alt={room.room_name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>
      <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography gutterBottom variant="h5" component="div" color="secondary" sx={{ fontWeight: 'bold' }}>
          {room.room_name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOnIcon sx={{ mr: 1, color: 'primary.main', fontSize: '1.2rem' }} />
          <Typography variant="body2" color="text.secondary">
            {room.location}
          </Typography>
        </Box>
        
        {room.description && room.description.trim() && (
          <Typography variant="body2" color="text.secondary" mb={2}>
            {room.description}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <MeetingRoomIcon sx={{ mr: 1, color: 'secondary.main' }} />
          <Typography variant="body2" color="secondary" sx={{ fontWeight: 'bold' }}>
            Kapasitas: <span style={{ color: 'text.secondary', fontWeight: 'normal' }}>{room.capacity} Orang</span>
          </Typography>
        </Box>
        
        {/* Features/Tags Section */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {room.features?.includes('AC') && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              border: '1px solid #FF9B0F', 
              borderRadius: '20px', 
              px: 1.5, 
              py: 0.5 
            }}>
              <AcUnitIcon sx={{ fontSize: '1rem', color: '#FF9B0F', mr: 0.5 }} />
              <Typography variant="caption" sx={{ color: '#FF9B0F', fontWeight: 'bold' }}>AC</Typography>
            </Box>
          )}
          {room.features?.includes('Wall Socket') && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              border: '1px solid #3C355F', 
              borderRadius: '20px', 
              px: 1.5, 
              py: 0.5 
            }}>
              <ElectricalServicesIcon sx={{ fontSize: '1rem', color: '#3C355F', mr: 0.5 }} />
              <Typography variant="caption" sx={{ color: '#3C355F', fontWeight: 'bold' }}>Wall Socket</Typography>
            </Box>
          )}
          {/* Show placeholder tags if no features */}
          {(!room.features || room.features.length === 0) && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              border: '1px solid #e0e0e0', 
              borderRadius: '20px', 
              px: 1.5, 
              py: 0.5 
            }}>
              <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic' }}>Features TBD</Typography>
            </Box>
          )}
        </Box>

        <Button 
          variant="contained" 
          fullWidth 
          onClick={handleButtonClick}
          sx={{ 
            backgroundColor: 'primary.main',
            color: '#fff',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            borderRadius: '20px',
            textTransform: 'none',
            boxShadow: 'none',
            mt: 'auto', // Push button to bottom
          }}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
