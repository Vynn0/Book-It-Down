import { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CssBaseline,
} from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { Navbar, SearchBar } from '../components/ui'

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
})

interface SearchPageProps {
  onBack: () => void
  userRole?: 'employee' | 'administrator'
}

function SearchPage({ onBack, userRole = 'employee' }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<string[]>([])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Simple mock search results
    const mockResults = [
      `${userRole === 'administrator' ? 'Admin' : 'Employee'} Result 1 for "${query}"`,
      `${userRole === 'administrator' ? 'Admin' : 'Employee'} Result 2 for "${query}"`,
      `${userRole === 'administrator' ? 'Admin' : 'Employee'} Result 3 for "${query}"`,
    ]
    setResults(query ? mockResults : [])
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <Navbar 
          title="Book It Down - Search" 
          onBack={onBack}
          userRole={userRole}
        />

        <Container maxWidth="md" sx={{ mt: 4 }}>
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
          {results.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" color="secondary" mb={2}>
                  Search Results
                </Typography>
                {results.map((result, index) => (
                  <Card key={index} sx={{ mb: 2, backgroundColor: '#f5f5f5' }}>
                    <CardContent>
                      <Typography variant="body1">{result}</Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <button style={{ 
                          padding: '6px 16px', 
                          border: '1px solid #FF9B0F', 
                          borderRadius: '4px',
                          backgroundColor: 'transparent',
                          color: '#FF9B0F',
                          cursor: 'pointer'
                        }}>
                          View Details
                        </button>
                        {userRole === 'administrator' && (
                          <button style={{ 
                            padding: '6px 16px', 
                            border: '1px solid #3C355F', 
                            borderRadius: '4px',
                            backgroundColor: 'transparent',
                            color: '#3C355F',
                            cursor: 'pointer'
                          }}>
                            Manage
                          </button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {/* No results message */}
          {searchQuery && results.length === 0 && (
            <Card>
              <CardContent>
                <Typography variant="body1" color="text.secondary" align="center">
                  No results found for "{searchQuery}"
                </Typography>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default SearchPage
