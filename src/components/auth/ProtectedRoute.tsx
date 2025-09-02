import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAuth } from '../../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    )
  }

  // If not authenticated, show fallback (login page) or redirect
  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : null
  }

  // If authenticated, show protected content
  return <>{children}</>
}
