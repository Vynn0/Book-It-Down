import { useState } from "react";
import RoomCard from "./RoomCard";
import EditRoomModal from "./EditRoomModal";

interface Room {
  room_id: number;
  room_name: string;
  location: string;
  capacity: number;
  description: string;
  created_at: string;
  features?: string[];
}

interface EditRoomProps {
  rooms: Room[];
}

export default function EditRoom({ rooms }: EditRoomProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectRoom = (room: Room) => {
    // karena hanya administrator, langsung buka modal
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {rooms.map((room) => (
        <RoomCard key={room.room_id} room={room} onSelect={handleSelectRoom} />
      ))}

      {selectedRoom && (
        <EditRoomModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          roomData={{
            name: selectedRoom.room_name,
            location: selectedRoom.location,
            capacity: selectedRoom.capacity,
            description: selectedRoom.description,
            images: [], // nanti bisa diisi data asli kalau tersedia
          }}
        />
      )}
    </div>
  );
}
