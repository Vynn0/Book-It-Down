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
import { EmployeeSearchView } from '../components/ui/Employee/EmployeeSearchView';
import { useRoleBasedRouting, useRoomManagement } from '../hooks';
import BookRoom from './BookRoom';

interface SearchPageProps {
  onBack: () => void;
  onProfileClick: () => void;
  onNavigateToAdmin: () => void;
  onNavigateToRoomManagement: () => void;
  initialActiveView?: string; // Perubahan: Tambahkan prop baru
}

const drawerWidth = 240; // Definisikan lebar drawer

function SearchPage({ onBack, onProfileClick, onNavigateToAdmin, onNavigateToRoomManagement, initialActiveView }: SearchPageProps) {
  
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [showBookRoom, setShowBookRoom] = useState(false);
  
  const { rooms, isLoadingRooms } = useRoomManagement();
  const { getRoleBasedView, isRoomManager, isEmployee, isAdmin, user } = useRoleBasedRouting();
  
  const [isSidebarOpen, setSidebarOpen] = useState(true); // State untuk sidebar
  
  // Handler untuk membuka/menutup sidebar
  const handleSidebarToggle = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Perubahan: Gunakan prop initialActiveView
  const [activeView, setActiveView] = useState(() => {
    if (initialActiveView) return initialActiveView; // Utamakan prop
    if (isRoomManager()) return 'roomManagement';
    if (isEmployee()) return 'addBooking';
    return 'search';
  });

  // Perubahan: Gunakan useEffect untuk sinkronisasi jika prop berubah
  useEffect(() => {
    if (initialActiveView) {
      setActiveView(initialActiveView);
    }
  }, [initialActiveView]);

  const handleMenuClick = (view: string) => {
    if (view === 'userManagement') {
      onNavigateToAdmin();
    } else if (view === 'roomManagement') {
      onNavigateToRoomManagement();
    } else {
      setActiveView(view);
    }
  };

  const handleSearch = (query: {
    tanggal: Date | null;
    kapasitas: number;
    jamMulai: Date | null;
    jamSelesai: Date | null;
  }) => {
    const filtered = rooms.filter(room => room.capacity >= query.kapasitas);
    setFilteredRooms(filtered);
    setHasSearched(true);
  };

  const handleBackFromBooking = () => {
    setSelectedRoom(null);
    setShowBookRoom(false);
  };

  const handleRoomSelect = (room: any) => {
    setSelectedRoom(room);
    setShowBookRoom(true);
  };

  const renderRoleBasedView = () => {
    const roleView = getRoleBasedView();

    switch (roleView) {
      case 'admin':
        return;
      case 'room-manager':
        return;
      case 'employee':
        return <EmployeeSearchView onBack={onBack} />;
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

  const getUserRoleForNavbar = (): 'employee' | 'administrator' => {
    if (isAdmin()) return 'administrator';
    return 'employee';
  };

  // Show BookRoom if a room is selected
  if (showBookRoom && selectedRoom) {
    return <BookRoom room={selectedRoom} onBack={handleBackFromBooking} />;
  }

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
            title={`Search Menu (${user?.name || 'User'})`}
            onBack={onBack}
            userRole={getUserRoleForNavbar()}
            onProfileClick={onProfileClick}
            onMenuClick={handleSidebarToggle}
          />
          <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
            {renderRoleBasedView()}
            <Card sx={{ mb: 4, mt: 4 }}>
              <CardContent>
                <Typography variant="h4" component="h1" color="secondary" mb={3}>
                  Search Rooms
                </Typography>
                <SearchBar onSearch={handleSearch} />
              </CardContent>
            </Card>

            {hasSearched ? (
              filteredRooms.length > 0 ? (
                <Box>
                  <Typography variant="h5" component="h2" color="secondary" mb={2}>
                    Search Results ({filteredRooms.length} rooms found)
                  </Typography>
                  {isLoadingRooms ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
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
                      {filteredRooms.map((room) => (
                        <RoomCard 
                          key={room.room_id} 
                          room={room} 
                          onSelect={handleRoomSelect}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              ) : (
                <Card>
                  <CardContent>
                    <Typography variant="body1" color="text.secondary" align="center">
                      No rooms found matching your criteria
                    </Typography>
                  </CardContent>
                </Card>
              )
            ) : (
              <Box>
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