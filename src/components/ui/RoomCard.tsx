import { Box, Card, CardContent, Typography, Button, Skeleton } from "@mui/material";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useEffect, useState, useMemo, useCallback } from "react";
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

// Simple cache to avoid repeated API calls for the same room
const imageCache = new Map<number, string | null>();

export default function RoomCard({ room, imageSrc, onSelect }: RoomCardProps) {
  const { getRoomImages } = useRoomImages();
  const [imageState, setImageState] = useState<{
    url: string | null;
    isLoading: boolean;
    hasAttempted: boolean;
  }>({
    url: null,
    isLoading: true,
    hasAttempted: false
  });

  // Memoize the final display image to prevent unnecessary re-calculations
  const displayImage = useMemo(() => {
    // Priority: Cached Supabase image > imageSrc prop > placeholder
    return imageState.url || imageSrc || "https://via.placeholder.com/345x180/3C355F/FFFFFF?text=Room+Image";
  }, [imageState.url, imageSrc]);

  // Optimized image loading with caching
  const loadRoomImage = useCallback(async (roomId: number) => {
    // Check cache first
    if (imageCache.has(roomId)) {
      const cachedUrl = imageCache.get(roomId) ?? null;
      setImageState({
        url: cachedUrl,
        isLoading: false,
        hasAttempted: true
      });
      return;
    }

    setImageState(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await getRoomImages(roomId);
      let primaryImageUrl: string | null = null;

      if (result.success && result.images) {
        // Find primary image or use first available
        const primaryImage = result.images.find(img => img.is_primary);
        primaryImageUrl = primaryImage?.image_url || result.images[0]?.image_url || null;
      }

      // Cache the result (even if null)
      imageCache.set(roomId, primaryImageUrl);
      
      setImageState({
        url: primaryImageUrl,
        isLoading: false,
        hasAttempted: true
      });
    } catch (error) {
      console.error('Error loading room image:', error);
      // Cache the failure
      imageCache.set(roomId, null);
      setImageState({
        url: null,
        isLoading: false,
        hasAttempted: true
      });
    }
  }, [getRoomImages]);

  // Load image only once per room
  useEffect(() => {
    if (!imageState.hasAttempted) {
      loadRoomImage(room.room_id);
    }
  }, [room.room_id, imageState.hasAttempted, loadRoomImage]);

  // Reset state when room changes
  useEffect(() => {
    setImageState({
      url: imageCache.get(room.room_id) || null,
      isLoading: !imageCache.has(room.room_id),
      hasAttempted: imageCache.has(room.room_id)
    });
  }, [room.room_id]);

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
          bgcolor: imageState.isLoading ? "#f5f5f5" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {imageState.isLoading ? (
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
