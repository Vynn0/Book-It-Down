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
import { useRoleBasedRouting, useRoomManagement, useBookingStatusChecker, useNavigation } from '../hooks';

interface SearchPageProps {
  onBack?: () => void;
  onProfileClick?: () => void;
  onNavigateToAdmin?: () => void;
  onNavigateToRoomManagement?: () => void;
  initialActiveView?: string; // Perubahan: Tambahkan prop baru
}

const drawerWidth = 240; // Definisikan lebar drawer

function SearchPage({ onBack, onProfileClick, onNavigateToAdmin, onNavigateToRoomManagement, initialActiveView }: SearchPageProps) {
  const { 
    goToLogin, 
    goToProfile, 
    goToAdminDashboard, 
    goToRoomManagement,
    goToBookRoom 
  } = useNavigation();
  
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { rooms, isLoadingRooms } = useRoomManagement();
  const { getRoleBasedView, isRoomManager, isEmployee, isAdmin, user } = useRoleBasedRouting();
  
  // Enable automatic booking status checking every 10 minutes
  useBookingStatusChecker(10);
  
  const [isSidebarOpen, setSidebarOpen] = useState(true); // State untuk sidebar
  
  // Handler untuk membuka/menutup sidebar
  const handleSidebarToggle = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Centralized navigation with prop fallbacks
  const handleBackToLogin = () => {
    if (onBack) {
      onBack();
    } else {
      goToLogin();
    }
  };

  const handleNavigateToProfile = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      goToProfile();
    }
  };

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
    if (isRoomManager()) return 'roomManagement';
    if (isEmployee()) return 'addBooking';
    if (isAdmin()) return 'addBooking'; // Admin should also default to addBooking when on search page
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

  const handleRoomSelect = (room: any) => {
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

  const getUserRoleForNavbar = (): 'employee' | 'administrator' => {
    if (isAdmin()) return 'administrator';
    return 'employee';
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
            title={`Search Menu (${user?.name || 'User'})`}
            onBack={handleBackToLogin}
            userRole={getUserRoleForNavbar()}
            onProfileClick={handleNavigateToProfile}
            onMenuClick={handleSidebarToggle}
          />
          <Container maxWidth="lg" sx={{ mt: 2, pb: 4 }}>
            {renderRoleBasedView()}
              <CardContent sx={{ p:3 }}>
                <Typography variant="h5" component="h1" color="secondary" mb={2}>
                  Search Rooms
                </Typography>
                <SearchBar onSearch={handleSearch} />
              </CardContent>

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
              <Box sx={{ p:3 }}>
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