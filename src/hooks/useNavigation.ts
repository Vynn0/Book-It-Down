import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigationService, type NavigationTarget, type NavigationOptions } from '../services/navigationService';
import { useAuth } from './useAuth';

/**
 * Centralized Navigation Hook
 * 
 * This hook provides a clean interface for all navigation operations.
 * It automatically initializes the navigation service and provides
 * role-aware navigation methods.
 * 
 * Usage:
 * const { navigateTo, canAccess, getDefaultRoute } = useNavigation();
 * navigateTo('admin-dashboard'); // Automatically handles role validation
 */
export function useNavigation() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Initialize navigation service with router navigate function
  useEffect(() => {
    navigationService.setNavigate(navigate);
  }, [navigate]);

  /**
   * Navigate to a specific target with role validation
   */
  const navigateTo = (target: NavigationTarget, options?: NavigationOptions) => {
    navigationService.navigateTo(target, user, options);
  };

  /**
   * Navigate back one step in history
   */
  const goBack = (fallback?: () => void) => {
    try {
      navigate(-1);
    } catch (error) {
      if (fallback) {
        fallback();
      } else {
        // Fallback to role-based dashboard
        navigateTo('dashboard');
      }
    }
  };

  /**
   * Navigate to profile (current user or specified user)
   */
  const goToProfile = (userId?: string) => {
    navigateTo('profile', { userId });
  };

  /**
   * Navigate to book room page
   */
  const goToBookRoom = (roomId: string) => {
    navigateTo('book-room', { roomId });
  };

  /**
   * Navigate to role-based dashboard
   */
  const goToDashboard = () => {
    navigateTo('dashboard');
  };

  /**
   * Navigate to search page
   */
  const goToSearch = () => {
    navigateTo('search');
  };

  /**
   * Navigate to admin dashboard (with role validation)
   */
  const goToAdminDashboard = () => {
    navigateTo('admin-dashboard');
  };

  /**
   * Navigate to room management (with role validation)
   */
  const goToRoomManagement = () => {
    navigateTo('room-management');
  };

  /**
   * Handle post-login navigation based on user roles
   */
  const handlePostLogin = () => {
    if (user) {
      navigationService.handlePostLoginNavigation(user);
    }
  };

  /**
   * Navigate to login page
   */
  const goToLogin = () => {
    navigateTo('login');
  };

  /**
   * Check if current user can access a specific route
   */
  const canAccess = (route: string): boolean => {
    return navigationService.canAccessRoute(route, user);
  };

  /**
   * Get the default route for current user
   */
  const getDefaultRoute = (): string => {
    return navigationService.getDefaultRoute(user);
  };

  return {
    // Basic navigation
    navigateTo,
    goBack,
    
    // Specific navigation methods
    goToProfile,
    goToBookRoom,
    goToDashboard,
    goToSearch,
    goToAdminDashboard,
    goToRoomManagement,
    goToLogin,
    
    // Special handlers
    handlePostLogin,
    
    // Utility methods
    canAccess,
    getDefaultRoute,
    
    // Current user context
    user,
  };
}