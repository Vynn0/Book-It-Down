import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CssBaseline,
  CircularProgress,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { appTheme } from '../services';
import { Navbar, SearchBar, RoomCard, Sidebar } from '../components/ui';
import { useRoleBasedRouting, useRoomManagement, useBookingStatusChecker, useNavigation, useRoomAvailabilitySearch } from '../hooks';

interface SearchPageProps {
  onProfileClick?: () => void;
  onNavigateToAdmin?: () => void;
  onNavigateToRoomManagement?: () => void;
  initialActiveView?: string; // Perubahan: Tambahkan prop baru
}

const drawerWidth = 240; // Definisikan lebar drawer

function SearchPage({ onNavigateToAdmin, onNavigateToRoomManagement, initialActiveView }: SearchPageProps) {
  const {
    goToAdminDashboard,
    goToRoomManagement,
    goToBookRoom
  } = useNavigation();

  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const { rooms, isLoadingRooms } = useRoomManagement();
  const { getRoleBasedView, user } = useRoleBasedRouting();
  const { searchAvailableRooms, isSearching } = useRoomAvailabilitySearch();

  // Enable automatic booking status checking every 10 minutes
  useBookingStatusChecker(10);

  const [isSidebarOpen, setSidebarOpen] = useState(true); // State untuk sidebar

  // Handler untuk membuka/menutup sidebar
  const handleSidebarToggle = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Centralized navigation with prop fallbacks
  const handleNavigateToAdmin = () => {
    if (onNavigateToAdmin) {
      onNavigateToAdmin();
    } else {
      goToAdminDashboard();
    }
  };

  const handleNavigateToRoomManagement = () => {
    if (onNavigateToRoomManagement) {
      onNavigateToRoomManagement();
    } else {
      goToRoomManagement();
    }
  };

  // Perubahan: Gunakan prop initialActiveView
  const [activeView, setActiveView] = useState(() => {
    if (initialActiveView) return initialActiveView; // Utamakan prop
    // All roles default to 'addBooking' when on search page for consistency
    return 'addBooking'; // Default to addBooking for any user on search page
  });

  // Perubahan: Gunakan useEffect untuk sinkronisasi jika prop berubah
  useEffect(() => {
    if (initialActiveView) {
      setActiveView(initialActiveView);
    }
  }, [initialActiveView]);

  const handleMenuClick = (view: string) => {
    if (view === 'userManagement') {
      handleNavigateToAdmin();
    } else if (view === 'roomManagement') {
      handleNavigateToRoomManagement();
    } else {
      setActiveView(view);
    }
  };

  const handleSearch = async (query: {
    tanggal: Date | null;
    kapasitas: number;
    jamMulai: Date | null;
    jamSelesai: Date | null;
  }) => {
    setSearchError(null);
    setHasSearched(true);

    try {
      console.log('Searching for available rooms with query:', query);

      // Basic validation
      if (!query.tanggal || !query.jamMulai || !query.jamSelesai || !query.kapasitas) {
        throw new Error('Please fill in all search fields');
      }

      // Use the new availability search that checks actual bookings
      const availableRooms = await searchAvailableRooms(query);
      setFilteredRooms(availableRooms);

      console.log(`Found ${availableRooms.length} available rooms`);
    } catch (error) {
      console.error('Error searching for available rooms:', error);
      setSearchError(error instanceof Error ? error.message : 'Failed to search for available rooms');
      setFilteredRooms([]);
    }
  }; const handleRoomSelect = (room: any) => {
    // Navigate to the room booking page using centralized navigation
    goToBookRoom(room.room_id.toString());
  };

  const renderRoleBasedView = () => {
    const roleView = getRoleBasedView();

    switch (roleView) {
      case 'admin':
        return;
      case 'room-manager':
        return;
      case 'employee':
        return;
      default:
        return (
          <Card>
            <CardContent>
              <Typography variant="body1" color="error" align="center">
                Access denied: No valid role found
              </Typography>
            </CardContent>
          </Card>
        );
    }
  };

  const getUserRoles = () => {
    if (!user?.roles || user.roles.length === 0) return 'No role assigned';
    return user.roles.map(role => role.role_name).join(', ');
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Sidebar
          activeView={activeView}
          onMenuClick={handleMenuClick}
          open={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: 'background.default',
            // Perubahan styling untuk efek push (sama seperti di halaman lain)
            transition: (theme) => theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: `-${drawerWidth}px`,
            ...(isSidebarOpen && {
              transition: (theme) => theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
              }),
              marginLeft: 0,
            }),
          }}
        >
          <Navbar
            title={`Search Menu (${getUserRoles()})`}
            onMenuClick={handleSidebarToggle}
          />
          <Container maxWidth="lg" sx={{ mt: 2, pb: 4 }}>
            {renderRoleBasedView()}
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" component="h1" color="secondary" mb={2}>
                Search Rooms
              </Typography>
              <SearchBar onSearch={handleSearch} />
            </CardContent>

            {hasSearched ? (
              isSearching ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>Searching for available rooms...</Typography>
                </Box>
              ) : searchError ? (
                <Card>
                  <CardContent>
                    <Typography variant="body1" color="error" align="center">
                      {searchError}
                    </Typography>
                  </CardContent>
                </Card>
              ) : filteredRooms.length > 0 ? (
                <Box>
                  <Typography variant="h5" component="h2" color="secondary" mb={2}>
                    Available Rooms ({filteredRooms.length} rooms found)
                  </Typography>
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: '1fr 1fr',
                      md: '1fr 1fr 1fr'
                    },
                    gap: 3
                  }}>
                    {filteredRooms.map((room) => (
                      <RoomCard
                        key={room.room_id}
                        room={room}
                        onSelect={handleRoomSelect}
                      />
                    ))}
                  </Box>
                </Box>
              ) : (
                <Card>
                  <CardContent>
                    <Typography variant="body1" color="text.secondary" align="center">
                      No rooms available for the selected date, time, and capacity requirements.
                      Try adjusting your search criteria.
                    </Typography>
                  </CardContent>
                </Card>
              )
            ) : (
              <Box sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" color="secondary" mb={2}>
                  All Rooms ({rooms.length} total)
                </Typography>
                {isLoadingRooms ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : rooms.length === 0 ? (
                  <Card>
                    <CardContent>
                      <Typography variant="body1" color="text.secondary" align="center">
                        No rooms available
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: '1fr 1fr',
                      md: '1fr 1fr 1fr'
                    },
                    gap: 3
                  }}>
                    {rooms.map((room) => (
                      <RoomCard
                        key={room.room_id}
                        room={room}
                        onSelect={handleRoomSelect}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default SearchPage;