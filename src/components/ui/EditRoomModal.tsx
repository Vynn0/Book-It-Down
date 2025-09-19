import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    if (images.length >= 3) return;

    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImages((prev) => [...prev, reader.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    if (currentIndex >= images.length - 1) {
      setCurrentIndex(0);
    }
  };

  const nextImage = () =>
    setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    console.log("Updated Room:", { ...formData, images });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Room</DialogTitle>
      <DialogContent dividers>
        {/* Tombol Kembali */}
        <Button
          onClick={onClose}
          variant="contained"
          sx={{ mb: 2, backgroundColor: "orange", "&:hover": { backgroundColor: "darkorange" } }}
        >
          Kembali
        </Button>

        {/* Carousel */}
        <div className="relative w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          {images.length > 0 ? (
            <img
              src={images[currentIndex]}
              alt="Room"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}

          {images.length > 1 && (
            <>
              <IconButton
                onClick={prevImage}
                sx={{
                  position: "absolute",
                  left: 8,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                }}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                onClick={nextImage}
                sx={{
                  position: "absolute",
                  right: 8,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                }}
              >
                <ChevronRight />
              </IconButton>
            </>
          )}
        </div>

        {/* Thumbnail + Upload */}
        <div className="flex gap-2 mt-3">
          {images.map((img, i) => (
            <div key={i} className="relative w-20 h-20">
              <img
                src={img}
                alt={`thumb-${i}`}
                className="w-full h-full object-cover rounded-lg border cursor-pointer"
                onClick={() => setCurrentIndex(i)}
              />
              <IconButton
                onClick={() => handleDeleteImage(i)}
                size="small"
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  backgroundColor: "red",
                  color: "white",
                  "&:hover": { backgroundColor: "darkred" },
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </div>
          ))}

          {images.length < 3 && (
            <label className="w-20 h-20 border-2 border-dashed flex items-center justify-center rounded-lg cursor-pointer">
              <Add />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Form Fields */}
        <div className="mt-4 space-y-3">
          <TextField
            fullWidth
            name="name"
            value={formData.name}
            onChange={handleChange}
            label="Room Name"
          />
          <TextField
            fullWidth
            name="location"
            value={formData.location}
            onChange={handleChange}
            label="Location"
          />
          <TextField
            fullWidth
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={handleChange}
            label="Capacity"
          />
          <TextField
            fullWidth
            name="description"
            value={formData.description}
            onChange={handleChange}
            label="Description"
            multiline
            rows={3}
          />
        </div>
      </DialogContent>

      {/* Actions */}
      <DialogActions>
        <Button color="error" variant="contained">
          Hapus Ruangan
        </Button>
        <Button onClick={handleUpdate} color="success" variant="contained">
          Perbarui
        </Button>
      </DialogActions>
    </Dialog>
  );
}
