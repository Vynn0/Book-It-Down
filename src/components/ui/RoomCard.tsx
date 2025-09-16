// import { useState } from "react";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Button,
//   Modal,
// } from "@mui/material";
// import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
// import LocationOnIcon from "@mui/icons-material/LocationOn";
// import RoomDetailModal from "./RoomDetailModal";

// interface Room {
//   room_id: number;
//   room_name: string;
//   location: string;
//   capacity: number;
//   description: string;
//   created_at: string;
//   features?: string[];
// }

// interface RoomCardProps {
//   room: Room;
//   imageSrc?: string;
// }

// export default function RoomCard({ room, imageSrc }: RoomCardProps) {
//   const [open, setOpen] = useState(false);

//   const displayImage =
//     imageSrc ||
//     "https://via.placeholder.com/345x180/3C355F/FFFFFF?text=Room+Image";

//   return (
//     <>
//       <Card
//         sx={{
//           maxWidth: 345,
//           borderRadius: "16px",
//           boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
//           backgroundColor: "#fff",
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//         <Box
//           sx={{
//             height: 180,
//             overflow: "hidden",
//             borderTopLeftRadius: "16px",
//             borderTopRightRadius: "16px",
//           }}
//         >
//           <img
//             src={displayImage}
//             alt={room.room_name}
//             style={{ width: "100%", height: "100%", objectFit: "cover" }}
//           />
//         </Box>
//         <CardContent>
//           <Typography gutterBottom variant="h6" sx={{ fontWeight: "bold" }}>
//             {room.room_name}
//           </Typography>

//           <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
//             <LocationOnIcon sx={{ mr: 1, color: "primary.main" }} />
//             <Typography variant="body2" color="text.secondary">
//               {room.location}
//             </Typography>
//           </Box>

//           <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
//             <MeetingRoomIcon sx={{ mr: 1, color: "secondary.main" }} />
//             <Typography variant="body2" color="secondary" sx={{ fontWeight: "bold" }}>
//               Kapasitas:{" "}
//               <span style={{ color: "#555", fontWeight: "normal" }}>
//                 {room.capacity} Orang
//               </span>
//             </Typography>
//           </Box>

//           <Button
//             variant="contained"
//             fullWidth
//             onClick={() => setOpen(true)}
//             sx={{
//               backgroundColor: "primary.main",
//               borderRadius: "20px",
//               textTransform: "none",
//             }}
//           >
//             View Details
//           </Button>
//         </CardContent>
//       </Card>

//       {/* Modal Detail */}
//       <Modal open={open} onClose={() => setOpen(false)}>
//         <Box
//           sx={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             width: "80%",
//             bgcolor: "background.paper",
//             boxShadow: 24,
//             borderRadius: 2,
//             p: 3,
//           }}
//         >
//           <RoomDetailModal room={room} onClose={() => setOpen(false)} />
//         </Box>
//       </Modal>
//     </>
//   );
// }
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import LocationOnIcon from "@mui/icons-material/LocationOn";

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
  imageSrc?: string;
  // make onSelect optional so existing usages without onSelect won't break the build
  onSelect?: (room: Room) => void;
}

export default function RoomCard({ room, imageSrc, onSelect }: RoomCardProps) {
  const displayImage =
    imageSrc ||
    "https://via.placeholder.com/345x180/3C355F/FFFFFF?text=Room+Image";

  return (
    <Card
      sx={{
        maxWidth: 345,
        borderRadius: "16px",
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
        }}
      >
        <img
          src={displayImage}
          alt={room.room_name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
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
