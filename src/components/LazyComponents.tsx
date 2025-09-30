// Example of how to implement lazy loading for your pages
// This would reduce the initial bundle size significantly

import { lazy, Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';

// Lazy load heavy pages
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const BookRoom = lazy(() => import('../pages/BookRoom'));
const BookingHistory = lazy(() => import('../pages/BookingHistory'));
const RoomManagement = lazy(() => import('../pages/RoomManagement'));

// Loading component
const PageLoader = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
    </Box>
);

// Usage in your router
const LazyRoute = ({ children }: { children: React.ReactNode }) => (
    <Suspense fallback={<PageLoader />}>
        {children}
    </Suspense>
);

export { AdminDashboard, BookRoom, BookingHistory, RoomManagement, LazyRoute };