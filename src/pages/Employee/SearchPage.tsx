import { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material'
import { Search, ArrowBack } from '@mui/icons-material'
import { createTheme, ThemeProvider } from '@mui/material/styles'

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
}

function SearchPage({ onBack }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<string[]>([])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple mock search results
    const mockResults = [
      `Result 1 for "${searchQuery}"`,
      `Result 2 for "${searchQuery}"`,
      `Result 3 for "${searchQuery}"`,
    ]
    setResults(searchQuery ? mockResults : [])
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color="secondary">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={onBack}
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Book It Down - Search
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h4" component="h1" color="secondary" mb={3}>
                Search Rooms
              </Typography>
              
              <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  label="Search for rooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter book title, author, or ISBN"
                  sx={{ flex: 1 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<Search />}
                  sx={{ px: 4, py: 2, minWidth: 120 }}
                >
                  Search
                </Button>
              </Box>
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
                      <Button 
                        variant="outlined" 
                        size="small" 
                        sx={{ mt: 1 }}
                      >
                        View Details
                      </Button>
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
