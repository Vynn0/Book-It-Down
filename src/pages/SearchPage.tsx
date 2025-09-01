import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CssBaseline,
  Grid,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Navbar, SearchBar } from '../components/ui';
import { CardRoom } from '../components/ui/CardRoom';

// Same theme as App.tsx
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF9B0F', // Orange
    },
    secondary: {
      main: '#3C355F', // Purple
    },
  },
});

interface SearchPageProps {
  onBack: () => void;
  userRole?: 'employee' | 'administrator';
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

function SearchPage({ onBack, userRole = 'employee' }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<typeof mockRooms>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const filteredRooms = mockRooms.filter(room => 
        room.name.toLowerCase().includes(query.toLowerCase()) || 
        room.description.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filteredRooms);
    } else {
      setResults([]);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <Navbar
          title="Book It Down - Search"
          onBack={onBack}
          userRole={userRole}
        />

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h4" component="h1" color="secondary" mb={3}>
                Search Rooms
              </Typography>
              <SearchBar
                onSearch={handleSearch}
                placeholder="Enter room name, location, or capacity"
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
                <Grid container spacing={3}>
                  {results.map((room, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <CardRoom {...room} />
                    </Grid>
                  ))}
                </Grid>
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
              <Grid container spacing={3}>
                {mockRooms.map((room, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <CardRoom {...room} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default SearchPage;
