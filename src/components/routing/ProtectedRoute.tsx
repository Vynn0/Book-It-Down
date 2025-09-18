import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: number[]; // Role IDs that are allowed
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requiredRoles = [],
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, hasRole } = useAuth();
  const location = useLocation();

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If specific roles are required, check if user has one of them
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.some(roleId => hasRole(roleId));
    
    if (!hasRequiredRole) {
      // Redirect to dashboard if user doesn't have required role
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

// Convenience components for specific role protection
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={[1]}> {/* Role ID 1 = Admin */}
      {children}
    </ProtectedRoute>
  );
}

export function RoomManagerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={[1, 2]}> {/* Role ID 1 = Admin, 2 = Room Manager */}
      {children}
    </ProtectedRoute>
  );
}

export function EmployeeRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={[1, 2, 3]}> {/* All roles can access employee features */}
      {children}
    </ProtectedRoute>
  );
}

// Route for guests (non-authenticated users)
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}