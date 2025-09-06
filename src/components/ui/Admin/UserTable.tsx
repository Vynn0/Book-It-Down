import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';

interface UserRole {
  role_id: number;
  role_name: string;
}

interface DatabaseUser {
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  roles?: UserRole[];
}

interface UserTableProps {
  users: DatabaseUser[];
  isLoading: boolean;
  error: string | null;
}

const UserTable: React.FC<UserTableProps> = ({ users, isLoading, error }) => {
  const getRoleColor = (roleName: string): 'error' | 'warning' | 'primary' | 'default' => {
    switch (roleName) {
      case 'Administrator':
        return 'error';
      case 'Room Manager':
        return 'warning';
      case 'Employee':
        return 'primary';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatUserId = (userId: string): string => {
    return userId ? String(userId).substring(0, 8) + '...' : 'N/A';
  };

  return (
    <Paper sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h5" component="h2" color="secondary">
          Users Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage all users in the system
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            {error}
          </Alert>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Roles</strong></TableCell>
                <TableCell><strong>Created At</strong></TableCell>
                <TableCell><strong>User ID</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.user_id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {user.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <Chip
                              key={role.role_id}
                              label={role.role_name}
                              size="small"
                              color={getRoleColor(role.role_name)}
                              variant="outlined"
                            />
                          ))
                        ) : (
                          <Chip
                            label="No Role"
                            size="small"
                            variant="outlined"
                            color="default"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(user.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        {formatUserId(user.user_id)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default UserTable;
