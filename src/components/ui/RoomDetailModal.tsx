// RoomDetailModal.tsx
import { Box, Typography, Button, Divider } from "@mui/material";

interface Room {
  room_id: number;
  room_name: string;
  location: string;
  capacity: number;
  description: string;
  created_at: string;
  features?: string[];
}

interface Props {
  room: Room;
  onClose: () => void;
}

export default function RoomDetailModal({ room, onClose }: Props) {
  return (
    <Box sx={{ display: "flex", gap: 3 }}>
      {/* Kiri: Info Ruangan */}
      <Box sx={{ flex: 1 }}>
        <Button
          variant="contained"
          color="warning"
          sx={{ mb: 2 }}
          onClick={onClose}
        >
          Kembali
        </Button>

        <Box
          sx={{
            width: "100%",
            height: 150,
            border: "1px solid #ccc",
            borderRadius: 2,
            mb: 2,
            backgroundColor: "#f9f9f9",
          }}
        />

        <Typography variant="h6" fontWeight="bold">
          {room.room_name}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Jumlah Orang: {room.capacity}
        </Typography>
        <Typography variant="body2">Tanggal: -</Typography>
        <Typography variant="body2">Mulai: -</Typography>
        <Typography variant="body2">Selesai: -</Typography>
        <Typography variant="body2">Keterangan: {room.description}</Typography>

        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 3,
            backgroundColor: "#FF9B0F",
            borderRadius: "20px",
            textTransform: "none",
          }}
        >
          Book
        </Button>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Kanan: Kalender */}
      <Box sx={{ flex: 2 }}>
        {/* Kamu bisa pakai library kalender seperti react-big-calendar / fullcalendar */}
        <Typography align="center" variant="h6">
          Kalender Booking
        </Typography>
        <Box
          sx={{
            mt: 2,
            height: 400,
            border: "1px solid #ddd",
            borderRadius: 2,
          }}
        >
          {/* Placeholder Kalender */}
        </Box>
      </Box>
    </Box>
  );
}
