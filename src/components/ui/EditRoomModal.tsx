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
} from "@mui/material";
import { ChevronLeft, ChevronRight, Add, Close } from "@mui/icons-material";

interface EditRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomData: {
    name: string;
    location: string;
    capacity: number;
    description: string;
    images: string[];
  };
}

export default function EditRoomModal({
  isOpen,
  onClose,
  roomData,
}: EditRoomModalProps) {
  const [images, setImages] = useState<string[]>(roomData.images || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState(roomData);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset ketika roomData / open berubah
  useEffect(() => {
    setImages(roomData.images ? [...roomData.images] : []);
    setFormData(roomData);
    setCurrentIndex(0);
  }, [roomData, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (images.length >= 3) return; // max 3

    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImages((prev) => [...prev, reader.result as string]);
      setCurrentIndex(images.length); // langsung ke gambar baru
    };
    reader.readAsDataURL(file);

    e.currentTarget.value = ""; // reset input agar bisa pilih file yang sama lagi
  };

  const handleDeleteImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);

    if (newImages.length === 0) {
      setCurrentIndex(0);
    } else if (index < currentIndex) {
      setCurrentIndex((ci) => ci - 1);
    } else if (currentIndex >= newImages.length) {
      setCurrentIndex(newImages.length - 1);
    }
  };

  const nextImage = () => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = () => {
    console.log("Updated Room:", { ...formData, images });
    onClose();
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
          {images.length > 0 ? (
            <img
              src={images[currentIndex]}
              alt={`room-${currentIndex}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Typography color="text.secondary">No Image</Typography>
          )}

          {images.length > 1 && (
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
        <Stack direction="row" spacing={1} alignItems="center" mt={2}>
          {images.map((img, i) => (
            <Box key={i} sx={{ position: "relative" }}>
              <Box
                component="img"
                src={img}
                onClick={() => setCurrentIndex(i)}
                sx={{
                  width: 80,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: 1,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  cursor: "pointer",
                }}
              />
              <IconButton
                size="small"
                onClick={() => handleDeleteImage(i)}
                sx={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  backgroundColor: "error.main",
                  color: "white",
                  "&:hover": { backgroundColor: "error.dark" },
                  boxShadow: 1,
                }}
                aria-label={`delete-image-${i}`}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          ))}

          <Button
            component="label"
            variant="outlined"
            startIcon={<Add />}
            sx={{ minWidth: 80, height: 60, borderStyle: "dashed" }}
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
            (max 3 gambar)
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
        <Button onClick={handleUpdate} color="success" variant="contained">
          PERBARUI
        </Button>
      </DialogActions>
    </Dialog>
  );
}
