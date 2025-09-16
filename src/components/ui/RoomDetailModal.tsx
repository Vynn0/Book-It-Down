// import { Box, Typography, Button, Divider } from "@mui/material";
// import Calendar from "./Calendar";

// interface Room {
//   room_id: number;
//   room_name: string;
//   location: string;
//   capacity: number;
//   description: string;
//   created_at: string;
//   features?: string[];
// }

// interface Props {
//   room: Room;
//   onClose: () => void;
// }

// export default function RoomDetailModal({ room, onClose }: Props) {
//   // contoh data booking
//   const events = [
//     {
//       title: "Dipesan",
//       start: "2025-09-01T08:00:00",
//       end: "2025-09-01T21:00:00",
//       status: "booked",
//     },
//     {
//       title: "Dipesan",
//       start: "2025-09-02T13:00:00",
//       end: "2025-09-02T16:00:00",
//       status: "booked",
//     },
//     {
//       title: "Menunggu",
//       start: "2025-09-28T07:00:00",
//       end: "2025-09-28T21:00:00",
//       status: "pending",
//     },
//   ];

//   return (
//     <Box sx={{ display: "flex", gap: 3, height: "80vh" }}>
//       {/* Kiri: Info Ruangan */}
//       <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
//         <Button
//           variant="contained"
//           color="warning"
//           sx={{ mb: 2 }}
//           onClick={onClose}
//         >
//           Kembali
//         </Button>

//         <Box
//           sx={{
//             width: "100%",
//             height: 150,
//             border: "1px solid #ccc",
//             borderRadius: 2,
//             mb: 2,
//             backgroundColor: "#f9f9f9",
//           }}
//         />

//         <Typography variant="h6" fontWeight="bold">
//           {room.room_name}
//         </Typography>
//         <Typography variant="body2" sx={{ mt: 1 }}>
//           Jumlah Orang: {room.capacity}
//         </Typography>
//         <Typography variant="body2">Tanggal: -</Typography>
//         <Typography variant="body2">Mulai: -</Typography>
//         <Typography variant="body2">Selesai: -</Typography>
//         <Typography variant="body2">Keterangan: {room.description}</Typography>

//         <Button
//           fullWidth
//           variant="contained"
//           sx={{
//             mt: "auto",
//             backgroundColor: "#FF9B0F",
//             borderRadius: "20px",
//             textTransform: "none",
//           }}
//         >
//           Book
//         </Button>
//       </Box>

//       <Divider orientation="vertical" flexItem />

//       {/* Kanan: Kalender Booking */}
//       <Box sx={{ flex: 2 }}>
//         <Calendar events={events} />
//       </Box>
//     </Box>
//   );
// }
