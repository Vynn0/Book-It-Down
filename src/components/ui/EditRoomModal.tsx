import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  Box,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Tooltip,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Add, Close, Star, StarBorder } from "@mui/icons-material";
import { useRoomImages} from "../../hooks";

interface EditRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomData: {
    room_id?: number;
    name: string;
    location: string;
    capacity: number;
    description: string;
    images?: string[]; // Keep for backward compatibility, but we'll use Supabase instead
  };
  onSave?: (roomId: number, formData: { room_name: string; location: string; capacity: number; description: string }) => Promise<{ success: boolean; message: string }>;
  onImageUpdate?: () => void; // Callback to refresh parent component when images change
}

export default function EditRoomModal({
  isOpen,
  onClose,
  roomData,
  onSave,
  onImageUpdate,
}: EditRoomModalProps) {
  // Use Supabase images instead of local state
  const { 
    images: roomImages, 
    isLoading: isImagesLoading, 
    error: imageError,
    uploadImage, 
    deleteImage, 
    getRoomImages, 
    setPrimaryImage 
  } = useRoomImages();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState(roomData);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load images from Supabase when modal opens and room changes
  useEffect(() => {
    if (isOpen && roomData.room_id) {
      getRoomImages(roomData.room_id);
    }
    setFormData(roomData);
    setCurrentIndex(0);
    setUploadError(null);
  }, [roomData.room_id, isOpen]); // Removed getRoomImages to prevent infinite loop

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!roomData.room_id) {
      setUploadError("Cannot upload images: Room ID not available");
      return;
    }

    const file = e.target.files[0];
    setUploadError(null);

    const result = await uploadImage(roomData.room_id, file, !roomImages || roomImages.length === 0);
    if (result.success) {
      setCurrentIndex(roomImages ? roomImages.length : 0); // Navigate to the new image
      if (onImageUpdate) onImageUpdate();
    } else {
      setUploadError(result.message);
    }

    e.currentTarget.value = ""; // Reset input
  };

  const handleDeleteImage = async (imageId: number) => {
    setUploadError(null);
    const result = await deleteImage(imageId);
    if (result.success) {
      // Adjust currentIndex if needed
      if (roomImages && currentIndex >= roomImages.length - 1) {
        setCurrentIndex(Math.max(0, roomImages.length - 2));
      }
      if (onImageUpdate) onImageUpdate();
    } else {
      setUploadError(result.message);
    }
  };

  const handleSetPrimaryImage = async (imageId: number) => {
    if (!roomData.room_id) return;
    setUploadError(null);
    
    const result = await setPrimaryImage(imageId, roomData.room_id);
    if (result.success) {
      if (onImageUpdate) onImageUpdate();
    } else {
      setUploadError(result.message);
    }
  };

  const nextImage = () => {
    if (!roomImages || roomImages.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % roomImages.length);
  };

  const prevImage = () => {
    if (!roomImages || roomImages.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + roomImages.length) % roomImages.length);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Room name is required';
    if (!formData.location.trim()) return 'Location is required';
    if (formData.capacity < 1) return 'Capacity must be at least 1';
    if (formData.capacity > 1000) return 'Capacity cannot exceed 1000';
    return null;
  };

  const handleUpdate = async () => {
    if (!onSave || !roomData.room_id) {
      console.log("Updated Room:", { ...formData, images: roomImages });
      onClose();
      return;
    }

    // Validate form data
    const validationError = validateForm();
    if (validationError) {
      alert(validationError); // You can replace this with a proper notification
      return;
    }

    setIsLoading(true);
    try {
      const result = await onSave(roomData.room_id, {
        room_name: formData.name,
        location: formData.location,
        capacity: formData.capacity,
        description: formData.description,
      });

      if (result.success) {
        onClose();
      }
    } catch (error) {
      console.error("Error updating room:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      {/* Title */}
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Edit Room</Typography>
          <Box />
        </Box>
      </DialogTitle>

      {/* Scrollable Content */}
      <DialogContent
        dividers
        sx={{ px: 3, pt: 1, pb: 2, maxHeight: "60vh", overflowY: "auto" }}
      >
        {/* Kembali Button */}
        <Box mb={2}>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              backgroundColor: "orange",
              color: "white",
              "&:hover": { backgroundColor: "darkorange" },
              px: 2,
              py: 0.8,
            }}
          >
            KEMBALI
          </Button>
        </Box>

        {/* Error Display */}
        {(uploadError || imageError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {uploadError || imageError}
          </Alert>
        )}

        {/* Main Image / Carousel */}
        <Box
          sx={{
            width: "100%",
            height: 240,
            bgcolor: (theme) => theme.palette.grey[100],
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {isImagesLoading ? (
            <CircularProgress />
          ) : (roomImages && roomImages.length > 0) ? (
            <img
              src={roomImages[currentIndex]?.image_url}
              alt={`room-${currentIndex}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Typography color="text.secondary">No Images</Typography>
          )}

          {roomImages && roomImages.length > 1 && (
            <>
              <IconButton
                aria-label="previous"
                onClick={prevImage}
                sx={{
                  position: "absolute",
                  left: 8,
                  backgroundColor: "rgba(0,0,0,0.45)",
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                }}
                size="small"
              >
                <ChevronLeft />
              </IconButton>

              <IconButton
                aria-label="next"
                onClick={nextImage}
                sx={{
                  position: "absolute",
                  right: 8,
                  backgroundColor: "rgba(0,0,0,0.45)",
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                }}
                size="small"
              >
                <ChevronRight />
              </IconButton>
            </>
          )}
        </Box>

        {/* Thumbnails + Upload */}
        <Stack direction="row" spacing={1} alignItems="center" mt={2} sx={{ flexWrap: 'wrap' }}>
          {roomImages && roomImages.map((image, i) => (
            <Box key={image.image_id} sx={{ position: "relative", mb: 1 }}>
              <Box
                component="img"
                src={image.image_url}
                onClick={() => setCurrentIndex(i)}
                sx={{
                  width: 80,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: 1,
                  border: (theme) => 
                    currentIndex === i 
                      ? `2px solid ${theme.palette.primary.main}` 
                      : `1px solid ${theme.palette.divider}`,
                  cursor: "pointer",
                  opacity: isImagesLoading ? 0.5 : 1,
                }}
              />
              
              {/* Primary indicator */}
              {image.is_primary && (
                <Tooltip title="Primary Image">
                  <Star
                    sx={{
                      position: "absolute",
                      top: -4,
                      left: -4,
                      fontSize: 16,
                      color: "gold",
                      backgroundColor: "white",
                      borderRadius: "50%",
                      p: 0.2,
                    }}
                  />
                </Tooltip>
              )}

              {/* Set as primary button */}
              {!image.is_primary && (
                <Tooltip title="Set as Primary Image">
                  <IconButton
                    size="small"
                    onClick={() => handleSetPrimaryImage(image.image_id)}
                    disabled={isImagesLoading}
                    sx={{
                      position: "absolute",
                      top: -6,
                      left: -6,
                      backgroundColor: "rgba(255,255,255,0.8)",
                      color: "gray",
                      "&:hover": { 
                        backgroundColor: "rgba(255,255,255,0.9)",
                        color: "gold" 
                      },
                      boxShadow: 1,
                      width: 20,
                      height: 20,
                    }}
                  >
                    <StarBorder fontSize="small" sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              )}

              {/* Delete button */}
              <IconButton
                size="small"
                onClick={() => handleDeleteImage(image.image_id)}
                disabled={isImagesLoading}
                sx={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  backgroundColor: "error.main",
                  color: "white",
                  "&:hover": { backgroundColor: "error.dark" },
                  boxShadow: 1,
                  width: 20,
                  height: 20,
                }}
                aria-label={`delete-image-${image.image_id}`}
              >
                <Close fontSize="small" sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ))}

          {/* Upload button */}
          <Button
            component="label"
            variant="outlined"
            startIcon={<Add />}
            disabled={isImagesLoading || !roomData.room_id}
            sx={{ 
              minWidth: 80, 
              height: 60, 
              borderStyle: "dashed",
              mb: 1,
            }}
          >
            <input
              ref={fileInputRef}
              accept="image/*"
              type="file"
              hidden
              onChange={handleImageUpload}
            />
            Upload
          </Button>

          <Typography variant="caption" color="text.secondary" ml={1}>
            {roomData.room_id ? "(unlimited images)" : "(save room first)"}
          </Typography>
        </Stack>

        {/* Form */}
        <Stack spacing={2} mt={3}>
          <TextField
            fullWidth
            label="Room Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            size="small"
          />
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            size="small"
          />
          <TextField
            fullWidth
            label="Capacity"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={handleChange}
            size="small"
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            size="small"
          />
        </Stack>
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="error" variant="contained" sx={{ mr: 1 }}>
          HAPUS RUANGAN
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={handleUpdate} color="success" variant="contained" disabled={isLoading}>
          {isLoading ? "UPDATING..." : "PERBARUI"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
