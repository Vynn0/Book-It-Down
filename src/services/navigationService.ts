import type { NavigateFunction } from 'react-router-dom';
import { SessionManager } from '../security/sessionManager';
import type { User } from '../hooks/useAuth';

/**
 * Centralized Navigation Service
 * 
 * This service provides a unified interface for all navigation operations in the application.
 * It handles role-based routing, fallback navigation, and maintains consistency across components.
 * 
 * Benefits:
 * - Single source of truth for all navigation logic
 * - Role-based routing centralized in one place
 * - Easy to maintain and modify navigation behavior
 * - Consistent navigation patterns across the app
 * - Separation of concerns (UI components don't handle routing logic)
 */

export type UserRole = 'admin' | 'room-manager' | 'employee';
export type NavigationTarget = 
  | 'login' 
  | 'dashboard' 
  | 'search' 
  | 'admin-dashboard' 
  | 'room-management' 
  | 'profile' 
  | 'book-room'
  | 'back';

export interface NavigationOptions {
  roomId?: string;
  userId?: string;
  fallback?: () => void;
}

class NavigationService {
  private navigate: NavigateFunction | null = null;
  
  /**
   * Initialize the navigation service with the router's navigate function
   */
  setNavigate(navigateFunction: NavigateFunction) {
    this.navigate = navigateFunction;
  }

  /**
   * Get user roles for navigation decisions
   */
  private getUserRoles(user: User | null): UserRole[] {
    if (!user?.roles) return ['employee'];
    
    const roles: UserRole[] = [];
    
    if (user.roles.some((role: any) => role.role_id === 1)) {
      roles.push('admin');
    }
    if (user.roles.some((role: any) => role.role_id === 2)) {
      roles.push('room-manager');
    }
    if (user.roles.length === 0 || user.roles.some((role: any) => role.role_id === 3)) {
      roles.push('employee');
    }
    
    return roles;
  }

  /**
   * Navigate to a specific target based on user role and context
   */
  navigateTo(target: NavigationTarget, user: User | null = null, options: NavigationOptions = {}) {
    if (!this.navigate) {
      console.warn('Navigation service not initialized. Using fallback.');
      if (options.fallback) {
        options.fallback();
      }
      return;
    }

    const roles = this.getUserRoles(user);
    
    try {
      switch (target) {
        case 'login':
          SessionManager.updateCurrentPage('login');
          this.navigate('/login');
          break;

        case 'dashboard':
          this.navigateToRoleBasedDashboard(roles);
          break;

        case 'search':
          SessionManager.updateCurrentPage('search');
          this.navigate('/searchpage');
          break;

        case 'admin-dashboard':
          if (roles.includes('admin')) {
            SessionManager.updateCurrentPage('admin');
            this.navigate('/admin/dashboard');
          } else {
            this.navigateToRoleBasedDashboard(roles);
          }
          break;

        case 'room-management':
          if (roles.includes('admin') || roles.includes('room-manager')) {
            SessionManager.updateCurrentPage('roomManagement');
            this.navigate('/rooms/management');
          } else {
            this.navigateToRoleBasedDashboard(roles);
          }
          break;

        case 'profile':
          if (options.userId) {
            this.navigate(`/profile/${options.userId}`);
          } else if (user?.userID) {
            this.navigate(`/profile/${user.userID}`);
          } else {
            this.navigate('/profile');
          }
          break;

        case 'book-room':
          if (options.roomId) {
            this.navigate(`/rooms/${options.roomId}/book`);
          } else {
            console.warn('Room ID required for book-room navigation');
            this.navigateTo('search', user);
          }
          break;

        case 'back':
          this.navigate(-1);
          break;

        default:
          console.warn(`Unknown navigation target: ${target}`);
          this.navigateToRoleBasedDashboard(roles);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      if (options.fallback) {
        options.fallback();
      }
    }
  }

  /**
   * Navigate to the appropriate dashboard based on user roles
   */
  private navigateToRoleBasedDashboard(roles: UserRole[]) {
    if (roles.includes('admin')) {
      SessionManager.updateCurrentPage('admin');
      this.navigate!('/admin/dashboard');
    } else if (roles.includes('room-manager')) {
      SessionManager.updateCurrentPage('roomManagement');
      this.navigate!('/rooms/management');
    } else {
      SessionManager.updateCurrentPage('search');
      this.navigate!('/searchpage');
    }
  }

  /**
   * Handle post-login navigation based on user roles
   */
  handlePostLoginNavigation(user: User) {
    const roles = this.getUserRoles(user);
    this.navigateToRoleBasedDashboard(roles);
  }

  /**
   * Check if user has permission to access a specific route
   */
  canAccessRoute(route: string, user: User | null): boolean {
    if (!user) return false;
    
    const roles = this.getUserRoles(user);
    
    // Define route permissions
    const routePermissions: Record<string, UserRole[]> = {
      '/admin/dashboard': ['admin'],
      '/rooms/management': ['admin', 'room-manager'],
      '/searchpage': ['admin', 'room-manager', 'employee'],
      '/profile': ['admin', 'room-manager', 'employee'],
      '/rooms/*/book': ['admin', 'room-manager', 'employee'],
    };

    // Check exact matches first
    if (routePermissions[route]) {
      return routePermissions[route].some(role => roles.includes(role));
    }

    // Check pattern matches
    for (const [pattern, allowedRoles] of Object.entries(routePermissions)) {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '[^/]+'));
        if (regex.test(route)) {
          return allowedRoles.some(role => roles.includes(role));
        }
      }
    }

    // Default: allow access to basic routes for all authenticated users
    return ['/searchpage', '/profile'].some(publicRoute => route.startsWith(publicRoute));
  }

  /**
   * Get the default route for a user based on their roles
   */
  getDefaultRoute(user: User | null): string {
    if (!user) return '/login';
    
    const roles = this.getUserRoles(user);
    
    if (roles.includes('admin')) {
      return '/admin/dashboard';
    } else if (roles.includes('room-manager')) {
      return '/rooms/management';
    } else {
      return '/searchpage';
    }
  }
}

// Export singleton instance
export const navigationService = new NavigationService();