import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CssBaseline,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { appTheme } from '../services'
import { Navbar, SearchBar } from '../components/ui';
import { AdminSearchView } from '../components/ui/AdminSearchView';
import { RoomManagerSearchView } from '../components/ui/RoomManagerSearchView';
import { EmployeeSearchView } from '../components/ui/EmployeeSearchView';
import { CardRoom } from '../components/ui/cardRoom';
import { useRoleBasedRouting } from '../hooks';

interface SearchPageProps {
  onBack: () => void;
}

// Mock room data
const mockRooms = [
  {
    imageSrc: 'https://placehold.co/600x400/D3D3D3/000000?text=Office+Room+1',
    name: 'Office Room',
    floor: '1',
    description: 'Meeting room office.',
    capacity: 16,
    features: ['AC', 'Wall Socket'],
  },
  {
    imageSrc: 'https://placehold.co/600x400/D3D3D3/000000?text=Office+Room+2',
    name: 'Office Room 2',
    floor: '3',
    description: 'Meeting room office.',
    capacity: 32,
    features: ['AC', 'Wall Socket'],
  },
  {
    imageSrc: 'https://placehold.co/600x400/D3D3D3/000000?text=Office+Room+3',
    name: 'Office Room 2',
    floor: '3',
    description: 'Meeting room office.',
    capacity: 32,
    features: ['AC', 'Wall Socket'],
  },
  {
    imageSrc: 'https://placehold.co/600x400/D3D3D3/000000?text=Office+Room+4',
    name: 'Office Room',
    floor: '1',
    description: 'Meeting room office.',
    capacity: 16,
    features: ['AC', 'Wall Socket'],
  },
];

function SearchPage({ onBack }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<typeof mockRooms>([]);
  const { getRoleBasedView, isAdmin, user } = useRoleBasedRouting();

  const handleSearch = (query: {
    tanggal: Date | null;
    kapasitas: number;
    jamMulai: Date | null;
    jamSelesai: Date | null;
  }) => {
    // For now, just show all rooms when search is performed
    // You can implement actual filtering logic here based on the query
    setSearchQuery(`Search with capacity: ${query.kapasitas}`);
    setResults(mockRooms);
  };

  const renderRoleBasedView = () => {
    const roleView = getRoleBasedView();
    
    switch (roleView) {
      case 'admin':
        return <AdminSearchView onBack={onBack} />;
      case 'room-manager':
        return <RoomManagerSearchView onBack={onBack} />;
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
        />

        <Container maxWidth="lg" sx={{ mt: 4 }}>
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
          {searchQuery ? (
            results.length > 0 ? (
              <Box>
                <Typography variant="h5" component="h2" color="secondary" mb={2}>
                  Search Results
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                  {results.map((room, index) => (
                    <Box key={index}>
                      <CardRoom {...room} />
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Card>
                <CardContent>
                  <Typography variant="body1" color="text.secondary" align="center">
                    No results found for "{searchQuery}"
                  </Typography>
                </CardContent>
              </Card>
            )
          ) : (
            <Box>
              <Typography variant="h5" component="h2" color="secondary" mb={2}>
                All Rooms
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                {mockRooms.map((room, index) => (
                  <Box key={index}>
                    <CardRoom {...room} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default SearchPage;
