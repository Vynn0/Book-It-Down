import { Box, Card, CardContent, Typography } from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import Button from '@mui/material/Button';

interface CardRoomProps {
  imageSrc: string;
  name: string;
  floor: string;
  description: string;
  capacity: number;
  features: string[];
}

export function CardRoom({
  imageSrc,
  name,
  floor,
  description,
  capacity,
  features,
}: CardRoomProps) {
  return (
    <Card sx={{ 
      maxWidth: 345, 
      borderRadius: '16px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff',
    }}>
      <Box sx={{
        height: 180,
        overflow: 'hidden',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
      }}>
        <img
          src={imageSrc}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>
      <CardContent sx={{ p: 2 }}>
        <Typography gutterBottom variant="h5" component="div" color="secondary" sx={{ fontWeight: 'bold' }}>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={1}>
          Lantai {floor}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <MeetingRoomIcon sx={{ mr: 1, color: 'secondary.main' }} />
          <Typography variant="body2" color="secondary" sx={{ fontWeight: 'bold' }}>
            Kapasitas: <span style={{ color: 'text.secondary', fontWeight: 'normal' }}>{capacity} Orang</span>
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {features.includes('AC') && (
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
          {features.includes('Wall Socket') && (
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
        </Box>

        <Button 
          variant="contained" 
          fullWidth 
          sx={{ 
            backgroundColor: 'primary.main',
            color: '#fff',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            borderRadius: '20px',
            textTransform: 'none',
            boxShadow: 'none',
          }}
        >
          Button
        </Button>
      </CardContent>
    </Card>
  );
}
