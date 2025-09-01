import { useAuth } from './useAuth';

export const ROLES = {
  ADMIN: 1,
  ROOM_MANAGER: 2,
  EMPLOYEE: 3
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

export function useRoleBasedRouting() {
  const { hasRole, getUserRoles, user } = useAuth();

  const isAdmin = () => hasRole(ROLES.ADMIN);
  const isRoomManager = () => hasRole(ROLES.ROOM_MANAGER);
  const isEmployee = () => hasRole(ROLES.EMPLOYEE);

  const getHighestRole = (): RoleType | null => {
    if (isAdmin()) return ROLES.ADMIN;
    if (isRoomManager()) return ROLES.ROOM_MANAGER;
    if (isEmployee()) return ROLES.EMPLOYEE;
    return null;
  };

  const getRoleBasedView = (): 'admin' | 'room-manager' | 'employee' | null => {
    if (isAdmin()) return 'admin';
    if (isRoomManager()) return 'room-manager';
    if (isEmployee()) return 'employee';
    return null;
  };

  const canAccessAdminDashboard = () => isAdmin();
  const canAccessRoomManagement = () => isAdmin() || isRoomManager();
  const canBookRooms = () => isAdmin() || isRoomManager() || isEmployee();

  return {
    isAdmin,
    isRoomManager,
    isEmployee,
    getHighestRole,
    getRoleBasedView,
    canAccessAdminDashboard,
    canAccessRoomManagement,
    canBookRooms,
    userRoles: getUserRoles(),
    user
  };
}
