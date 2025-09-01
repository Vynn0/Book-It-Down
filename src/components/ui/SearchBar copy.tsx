import { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  InputAdornment
} from '@mui/material'
import { Search, Clear } from '@mui/icons-material'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  initialValue?: string
}

function SearchBar({ 
  onSearch, 
  placeholder = "Search...",
  initialValue = ""
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialValue)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery.trim())
  }

  const handleClear = () => {
    setSearchQuery('')
    onSearch('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        display: 'flex', 
        gap: 2, 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center'
      }}
    >
      <TextField
        fullWidth
        label="Search"
        value={searchQuery}
        onChange={handleInputChange}
        placeholder={placeholder}
        sx={{ flex: 1 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="action" />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <Button
                onClick={handleClear}
                size="small"
                sx={{ minWidth: 'auto', p: 0.5 }}
              >
                <Clear fontSize="small" />
              </Button>
            </InputAdornment>
          ),
        }}
      />
      
      <Box sx={{ display: 'flex', gap: 1, minWidth: { sm: 'auto', xs: '100%' } }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={<Search />}
          sx={{ 
            px: 4, 
            py: 2, 
            minWidth: 120,
            flex: { xs: 1, sm: 'none' }
          }}
          disabled={!searchQuery.trim()}
        >
          Search
        </Button>
      </Box>
    </Box>
  )
}

export default SearchBar
