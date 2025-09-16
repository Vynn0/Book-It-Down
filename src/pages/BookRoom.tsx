import { useState } from "react";
import { Box, Typography, Button, Divider } from "@mui/material";
import Calendar from "../components/ui/Calendar";

interface Room {
  room_id: number;
  room_name: string;
  location: string;
  capacity: number;
  description: string;
  created_at: string;
  features?: string[];
}

const BookRoom: React.FC<{ room: Room; onBack: () => void }> = ({
  room,
  onBack,
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [bookingEvents, setBookingEvents] = useState<
    { title: string; start: string; end: string; status?: string }[]
  >([]);

  const handleBook = () => {
    if (!selectedDate) return;
    const newEvent = {
      title: `Booking ${room.room_name}`,
      start: selectedDate,
      end: selectedDate,
      status: "pending",
    };
    setBookingEvents([...bookingEvents, newEvent]);
    alert(`Ruangan ${room.room_name} berhasil dipesan untuk ${selectedDate}`);
  };

  return (
    <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      <Button
        variant="outlined"
        color="inherit"
        onClick={onBack}
        sx={{ alignSelf: "flex-start" }}
      >
        ← Kembali
      </Button>

      <Typography variant="h5" fontWeight="bold">
        {room.room_name}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {room.description}
      </Typography>

      <Divider />

      {/* Kalender */}
      <Box sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2, height: 500 }}>
        <Calendar events={bookingEvents} />
      </Box>

      {/* Form Booking */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <input
          type="date"
          className="border rounded p-2"
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={handleBook}
          disabled={!selectedDate}
          sx={{
            backgroundColor: "#1976d2",
            "&:hover": { backgroundColor: "#1565c0" },
          }}
        >
          Book
        </Button>
      </Box>
    </Box>
  );
};

export default BookRoom;
