import { Box, Card, CardContent, Typography, Button, Skeleton } from "@mui/material";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useEffect, useState } from "react";
import { useRoomImages } from "../../hooks";

interface Room {
  room_id: number;
  room_name: string;
  location: string;
  capacity: number;
  description: string;
  created_at: string;
  features?: string[];
}

interface RoomCardProps {
  room: Room;
  imageSrc?: string; // Keep for backward compatibility, but will be overridden by Supabase primary image
  // make onSelect optional so existing usages without onSelect won't break the build
  onSelect?: (room: Room) => void;
}

export default function RoomCard({ room, imageSrc, onSelect }: RoomCardProps) {
  const { getRoomImages } = useRoomImages();
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);

  // Load primary image from Supabase
  useEffect(() => {
    const loadPrimaryImage = async () => {
      setIsLoadingImage(true);
      setPrimaryImageUrl(null); // Reset image URL
      
      try {
        const result = await getRoomImages(room.room_id);
        if (result.success && result.images) {
          // Find the primary image
          const primaryImage = result.images.find(img => img.is_primary);
          
          if (primaryImage) {
            setPrimaryImageUrl(primaryImage.image_url);
          } else if (result.images.length > 0) {
            // If no primary image is set, use the first image
            setPrimaryImageUrl(result.images[0].image_url);
          }
        }
      } catch (error) {
        console.error('Error loading room image:', error);
      } finally {
        setIsLoadingImage(false);
      }
    };

    loadPrimaryImage();
  }, [room.room_id]); // Only depend on room.room_id

  // Priority: Supabase primary image > passed imageSrc > placeholder
  const displayImage = 
    primaryImageUrl || 
    imageSrc || 
    "https://via.placeholder.com/345x180/3C355F/FFFFFF?text=Room+Image";

  return (
    <Card
      sx={{
        maxWidth: 345,
        borderRadius: "16px",
        border: "2px solid rgba(0,0,0,0.2)",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          height: 180,
          overflow: "hidden",
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          position: "relative",
          bgcolor: isLoadingImage ? "#f5f5f5" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isLoadingImage ? (
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            animation="wave"
          />
        ) : (
          <img
            src={displayImage}
            alt={room.room_name}
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "cover",
              transition: "opacity 0.3s ease-in-out"
            }}
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = "https://via.placeholder.com/345x180/3C355F/FFFFFF?text=Room+Image";
            }}
          />
        )}
      </Box>
      <CardContent>
        <Typography gutterBottom variant="h6" sx={{ fontWeight: "bold" }}>
          {room.room_name}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <LocationOnIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="body2" color="text.secondary">
            {room.location}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <MeetingRoomIcon sx={{ mr: 1, color: "secondary.main" }} />
          <Typography
            variant="body2"
            color="secondary"
            sx={{ fontWeight: "bold" }}
          >
            Kapasitas:{" "}
            <span style={{ color: "#555", fontWeight: "normal" }}>
              {room.capacity} Orang
            </span>
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={() => onSelect?.(room)} // safe-call: hanya panggil ketika ada
          sx={{
            backgroundColor: "primary.main",
            borderRadius: "20px",
            textTransform: "none",
          }}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
