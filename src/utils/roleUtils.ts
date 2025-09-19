// Utility functions for role-related operations

export const getRoleColor = (roleName: string): 'error' | 'warning' | 'info' | 'default' => {
    switch (roleName) {
        case 'Administrator':
            return 'error';
        case 'RoomManager':
            return 'warning';
        case 'Employee':
            return 'info';
        default:
            return 'default';
    }
}
