import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  CardMedia
} from '@mui/material';
import { ChevronLeft, ChevronRight, ImageNotSupported } from '@mui/icons-material';

interface RoomImage {
  image_url: string;
  image_name?: string;
  is_primary?: boolean;
}

interface RoomImageCarouselProps {
  images: RoomImage[];
  isLoading: boolean;
  height?: number | string;
  enableKeyboardNavigation?: boolean;
  showImageCounter?: boolean;
  showPrimaryIndicator?: boolean;
  sx?: object;
}

const RoomImageCarousel: React.FC<RoomImageCarouselProps> = ({
  images,
  isLoading,
  height = 250,
  enableKeyboardNavigation = true,
  showImageCounter = true,
  showPrimaryIndicator = true,
  sx = {}
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset current image index when images change
  useEffect(() => {
    if (images.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [images.length]);

  // Image navigation functions - using useCallback to prevent unnecessary re-renders
  const handlePrevImage = useCallback(() => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  }, [images.length]);

  const handleNextImage = useCallback(() => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  }, [images.length]);

  // Keyboard navigation for carousel
  useEffect(() => {
    if (!enableKeyboardNavigation || images.length <= 1) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handlePrevImage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNextImage();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, handlePrevImage, handleNextImage, enableKeyboardNavigation]);

  // Loading state
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
          border: '2px dashed #ddd',
          ...sx
        }}
      >
        <CircularProgress size={30} />
        <Typography sx={{ ml: 2, color: 'text.secondary' }}>Loading images...</Typography>
      </Box>
    );
  }

  // No images state
  if (!images || images.length === 0) {
    return (
      <Box 
        sx={{ 
          height, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
          color: 'text.secondary',
          border: '2px dashed #ddd',
          ...sx
        }}
      >
        <ImageNotSupported sx={{ fontSize: 48, mb: 2, color: 'text.disabled' }} />
        <Typography variant="body1" sx={{ fontWeight: 500 }}>No images available</Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>Room images will appear here</Typography>
      </Box>
    );
  }

  const currentImage = images[currentImageIndex];

  return (
    <Box 
      sx={{ 
        position: 'relative', 
        borderRadius: 2, 
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        backgroundColor: '#000',
        ...sx
      }}
    >
      <CardMedia
        component="img"
        height={height}
        image={currentImage?.image_url}
        alt={currentImage?.image_name || `Room image ${currentImageIndex + 1}`}
        sx={{
          objectFit: 'cover',
          width: '100%',
          backgroundColor: '#f5f5f5',
          transition: 'opacity 0.3s ease-in-out'
        }}
        onError={(e) => {
          console.error('Image failed to load:', currentImage?.image_url);
          e.currentTarget.style.display = 'none';
        }}
      />
      
      {/* Navigation arrows - always show if more than 1 image */}
      {images.length > 1 && (
        <>
          <IconButton
            onClick={handlePrevImage}
            sx={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'white',
              width: 40,
              height: 40,
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.8)',
                transform: 'translateY(-50%) scale(1.1)',
              },
              transition: 'all 0.2s ease'
            }}
            size="medium"
          >
            <ChevronLeft fontSize="large" />
          </IconButton>
          <IconButton
            onClick={handleNextImage}
            sx={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'white',
              width: 40,
              height: 40,
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.8)',
                transform: 'translateY(-50%) scale(1.1)',
              },
              transition: 'all 0.2s ease'
            }}
            size="medium"
          >
            <ChevronRight fontSize="large" />
          </IconButton>
        </>
      )}

      {/* Image indicators - only show if more than 1 image */}
      {images.length > 1 && (
        <Box sx={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '6px 12px',
          borderRadius: 3
        }}>
          {images.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: index === currentImageIndex 
                  ? 'white' 
                  : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: index === currentImageIndex 
                    ? 'white' 
                    : 'rgba(255,255,255,0.7)',
                  transform: 'scale(1.2)'
                }
              }}
            />
          ))}
        </Box>
      )}

      {/* Image counter */}
      {showImageCounter && (
        <Box sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 10px',
          borderRadius: 2,
          fontSize: '0.875rem',
          fontWeight: 500,
          backdropFilter: 'blur(4px)'
        }}>
          {currentImageIndex + 1} / {images.length}
        </Box>
      )}

      {/* Primary indicator */}
      {showPrimaryIndicator && currentImage?.is_primary && (
        <Box sx={{
          position: 'absolute',
          top: 12,
          left: 12,
          backgroundColor: 'rgba(76, 175, 80, 0.9)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 1,
          fontSize: '0.75rem',
          fontWeight: 600,
          backdropFilter: 'blur(4px)'
        }}>
          PRIMARY
        </Box>
      )}
    </Box>
  );
};

export default RoomImageCarousel;