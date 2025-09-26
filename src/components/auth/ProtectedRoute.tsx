import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, useNavigation } from '../../hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: number[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requiredRoles = [],
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, hasRole, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.some(roleId => hasRole(roleId));
    
    if (!hasRequiredRole) {
      // Jika tidak punya peran, arahkan ke searchpage sebagai fallback
      return <Navigate to="/searchpage" replace />;
    }
  }

  return <>{children}</>;
}

// ... (Komponen AdminRoute, RoomManagerRoute, EmployeeRoute tidak berubah) ...
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


// === UBAH LOGIKA GUESTROUTE DI BAWAH INI ===
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { getDefaultRoute } = useNavigation(); // <-- Gunakan hook navigasi

  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (isAuthenticated) {
    // Jangan redirect ke '/searchpage' secara statis.
    // Gunakan fungsi getDefaultRoute() untuk mendapatkan tujuan yang benar
    // berdasarkan peran pengguna yang sedang login.
    const defaultRoute = getDefaultRoute();
    return <Navigate to={defaultRoute} replace />;
  }
  
  return <>{children}</>;
}