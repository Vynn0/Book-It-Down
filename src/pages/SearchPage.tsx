
import { useState } from 'react';
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
import { appTheme } from '../services'
import { Navbar, SearchBar, RoomCard } from '../components/ui';
import { AdminSearchView } from '../components/ui/Admin/AdminSearchView';
import { RoomManagerSearchView } from '../components/ui/Room Manager/RoomManagerSearchView';
import { EmployeeSearchView } from '../components/ui/Employee/EmployeeSearchView';
import { useRoleBasedRouting, useRoomManagement } from '../hooks';
import { SessionManager } from '../security/sessionManager';
import AdminDashboard from './AdminDashboard';

interface SearchPageProps {
  onBack: () => void;
  onProfileClick: () => void;
}

function SearchPage({ onBack, onProfileClick }: SearchPageProps) {
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Get rooms data from useRoomManagement hook
  const { rooms, isLoadingRooms } = useRoomManagement();

  // Initialize currentView from session
  const getInitialView = (): 'search' | 'admin' => {
    const session = SessionManager.getSession();
    return (session?.subView === 'admin') ? 'admin' : 'search';
  };

  const [currentView, setCurrentView] = useState<'search' | 'admin'>(getInitialView);
  const { getRoleBasedView, isAdmin, user } = useRoleBasedRouting();

  const handleSearch = (query: {
    tanggal: Date | null;
    kapasitas: number;
    jamMulai: Date | null;
    jamSelesai: Date | null;
  }) => {
    // Filter rooms based on capacity
    const filtered = rooms.filter(room => room.capacity >= query.kapasitas);
    setFilteredRooms(filtered);
    setHasSearched(true);
  };

  const handleAdminAccess = () => {
    // Navigate to admin dashboard (replaces entire SearchPage)
    setCurrentView('admin');
    SessionManager.updateCurrentPage('search', 'admin');
  };

  const handleRoomManagerAccess = () => {
    // Navigate to room management page
    onProfileClick();
    SessionManager.updateCurrentPage('roomManagement');
  };

  const handleBackFromAdmin = () => {
    // Go back to search view
    setCurrentView('search');
    SessionManager.updateCurrentPage('search', 'search');
  };

  // If user is viewing admin dashboard, show AdminDashboard component
  if (currentView === 'admin' && isAdmin()) {
    return <AdminDashboard onBack={handleBackFromAdmin} onProfileClick={onProfileClick} />;
  }

  const renderRoleBasedView = () => {
    const roleView = getRoleBasedView();

    switch (roleView) {
      case 'admin':
        return <AdminSearchView goToAdminDashboard={handleAdminAccess} />;
      case 'room-manager':
        return <RoomManagerSearchView goToRoomManagement={handleRoomManagerAccess} />;
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

  // Get user role for navbar display
  const getUserRoleForNavbar = (): 'employee' | 'administrator' => {
    if (isAdmin()) return 'administrator';
    return 'employee';
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <Navbar
          title={`Book It Down - Search (${user?.name || 'User'})`}
          onBack={onBack}
          userRole={getUserRoleForNavbar()}
          onProfileClick={onProfileClick}
        />

        <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
          {/* Role-based view */}
          {renderRoleBasedView()}

          <Card sx={{ mb: 4, mt: 4 }}>
            <CardContent>
              <Typography variant="h4" component="h1" color="secondary" mb={3}>
                Search Rooms
              </Typography>
              <SearchBar
                onSearch={handleSearch}
              />
            </CardContent>
          </Card>

          {/* Search Results */}
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
                      <RoomCard key={room.room_id} room={room} />
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
                    <RoomCard key={room.room_id} room={room} />
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default SearchPage;
