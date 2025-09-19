import { useState } from 'react';

// Define the type for a single room
interface Room {
  imageSrc: string;
  name: string;
  floor: string;
  description: string;
  capacity: number;
  features: string[];
}

// Define the return type of the hook
interface UseRoomSearchReturn {
  searchQuery: string;
  results: Room[];
  handleSearch: (query: string) => void;
}

/**
 * A custom hook for handling room search logic.
 * @param rooms The array of rooms to search through.
 * @returns An object containing the search query, results, and the search handler function.
 */
export const useRoomSearch = (rooms: Room[]): UseRoomSearchReturn => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Room[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const filteredRooms = rooms.filter(room => 
        room.name.toLowerCase().includes(query.toLowerCase()) || 
        room.description.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filteredRooms);
    } else {
      setResults([]);
    }
  };

  return { searchQuery, results, handleSearch };
};
