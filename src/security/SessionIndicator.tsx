import React from 'react';
import { Box, Typography, Chip, LinearProgress } from '@mui/material';
import { AccessTime, Security } from '@mui/icons-material';
import { useSession } from './SessionProvider';

interface SessionIndicatorProps {
  showTimeRemaining?: boolean;
  compact?: boolean;
}

export const SessionIndicator: React.FC<SessionIndicatorProps> = ({ 
  showTimeRemaining = true, 
  compact = false 
}) => {
  const { timeRemaining, isSessionValid } = useSession();

  if (!isSessionValid) return null;

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressValue = (): number => {
    const totalTime = 15 * 60 * 1000; // 15 minutes
    return (timeRemaining / totalTime) * 100;
  };

  const getColor = (): 'success' | 'warning' | 'error' => {
    const minutes = Math.floor(timeRemaining / 60000);
    if (minutes > 10) return 'success';
    if (minutes > 5) return 'warning';
    return 'error';
  };

  if (compact) {
    return (
      <Chip
        icon={<AccessTime />}
        label={formatTime(timeRemaining)}
        color={getColor()}
        size="small"
        variant="outlined"
      />
    );
  }

  return (
    <Box sx={{ minWidth: 200, p: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Security sx={{ mr: 1, fontSize: '1rem' }} />
        <Typography variant="caption" color="text.secondary">
          Session Active
        </Typography>
      </Box>
      
      {showTimeRemaining && (
        <>
          <Typography variant="body2" color={getColor()} sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {formatTime(timeRemaining)} remaining
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={getProgressValue()} 
            color={getColor()}
            sx={{ height: 4, borderRadius: 2 }}
          />
        </>
      )}
    </Box>
  );
};
