import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { appTheme } from './services';
import { AuthProvider } from './components/auth';
import { SessionProvider } from './security';
import { ProtectedRoute, GuestRoute, AdminRoute, RoomManagerRoute } from './components/routing/ProtectedRoute';

// Import pages directly (no wrappers needed)
import LandingPage from './pages/LandingPage';
import SearchPage from './pages/SearchPage';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import RoomManagement from './pages/RoomManagement'; // Import the RoomManagement component
import BookRoom from './pages/BookRoom';
import BookingHistory from './pages/BookingHistory'; // <-- 1. TAMBAHKAN IMPORT INI


// Create router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/searchpage" replace />,
  },
  {
    path: "/login",
    element: (
      <GuestRoute>
        <LandingPage />
      </GuestRoute>
    ),
  },
  {
    path: "/searchpage",
    element: (
      <ProtectedRoute>
        <SearchPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: <Navigate to="/searchpage" replace />,
  },
  {
    path: "/admin",
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
    ],
  },
  {
    path: "/profile/:userId?",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
    {
      path: "/history",
      element: (
        <ProtectedRoute>
          <BookingHistory />
        </ProtectedRoute>
      )
    },
  {
    path: "/rooms",
    children: [
      {
        path: "management",
        element: (
          <RoomManagerRoute>
            <RoomManagement />
          </RoomManagerRoute>
        ),
      },
      {
        path: ":roomId/book",
        element: (
          <ProtectedRoute>
            <BookRoom />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AuthProvider>
        <SessionProvider>
          <RouterProvider router={router} />
        </SessionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;