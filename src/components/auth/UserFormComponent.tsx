import { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material'
import { PersonAdd, Visibility, VisibilityOff } from '@mui/icons-material'
import type { UserForm } from '../../hooks/Users/useUserManagement'

interface UserFormComponentProps {
  userForm: UserForm
  isLoading: boolean
  onInputChange: (field: keyof UserForm, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  submitButtonText?: string
}

function UserFormComponent({
  userForm,
  isLoading,
  onInputChange,
  onSubmit,
  submitButtonText = 'Add User'
}: UserFormComponentProps) {
  const [showPassword, setShowPassword] = useState(false)

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleInputChange = (field: keyof UserForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(field, e.target.value)
  }

  return (
    <Box component="form" onSubmit={onSubmit}>
      <TextField
        fullWidth
        label="Full Name"
        value={userForm.name}
        onChange={handleInputChange('name')}
        required
        margin="normal"
        placeholder="Enter user's full name"
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        type="email"
        label="Email Address"
        value={userForm.email}
        onChange={handleInputChange('email')}
        required
        margin="normal"
        placeholder="Enter user's email"
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        type={showPassword ? 'text' : 'password'}
        label="Password"
        value={userForm.password}
        onChange={handleInputChange('password')}
        required
        margin="normal"
        placeholder="Enter secure password (min 6 characters)"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleTogglePasswordVisibility}
                edge="end"
                aria-label="toggle password visibility"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} /> : <PersonAdd />}
        sx={{
          py: 1.5,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1.1rem',
          fontWeight: 600,
        }}
      >
        {isLoading ? 'Processing...' : submitButtonText}
      </Button>
    </Box>
  )
}

export default UserFormComponent
